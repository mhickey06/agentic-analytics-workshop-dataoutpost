"""Bonus: OpenTelemetry GenAI spans for your agent, written to MotherDuck.

Off unless TRACE_TO_MOTHERDUCK=1. Spans follow the OpenTelemetry GenAI conventions
(invoke_agent, chat, execute_tool). An exporter flattens them into workshop_traces.spans,
with the same columns as the spans table behind the Agent observability Dive in the
MotherDuck Dive gallery, plus question and sql. The agent_traces view has one row per trace.

TRACES_DB picks where they go: md:workshop_traces (default), or a local DuckDB file for tests.
Used by server.py (level 3, one span per tool call) and agent.py (level 4, the full run tree).
"""

import atexit
import hashlib
import os
import sys
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Iterator, Sequence

from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import ReadableSpan, TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, SpanExporter, SpanExportResult
from opentelemetry.trace import Span, Status, StatusCode, Tracer

ENABLED = os.environ.get("TRACE_TO_MOTHERDUCK") == "1"
TARGET = os.environ.get("TRACES_DB", "md:workshop_traces")

# Same names and types as the gallery Dive's spans table, then three columns of ours.
COLUMNS = [
    ("trace_id", "BIGINT"), ("span_id", "BIGINT"), ("parent_span_id", "BIGINT"), ("case_id", "BIGINT"),
    ("span_name", "VARCHAR"), ("gen_ai_operation_name", "VARCHAR"), ("gen_ai_agent_name", "VARCHAR"),
    ("gen_ai_request_model", "VARCHAR"), ("gen_ai_tool_name", "VARCHAR"), ("gen_ai_tool_call_id", "VARCHAR"),
    ("start_time", "TIMESTAMP"), ("end_time", "TIMESTAMP"), ("duration_ms", "BIGINT"), ("status_code", "VARCHAR"),
    ("error_type", "VARCHAR"), ("tool_result_status", "VARCHAR"), ("input_tokens", "BIGINT"),
    ("output_tokens", "BIGINT"), ("attempt_number", "INTEGER"), ("llm_cost_micros", "BIGINT"),
    ("tool_cost_micros", "BIGINT"), ("service_name", "VARCHAR"), ("question", "VARCHAR"), ("sql", "VARCHAR"),
]

AGENT_TRACES = """
CREATE OR REPLACE VIEW {p}agent_traces AS
SELECT trace_id,
       any_value(case_id) AS case_id,
       coalesce(max(gen_ai_agent_name), any_value(service_name)) AS agent_name,
       any_value(service_name) AS workflow,
       max(gen_ai_request_model) AS model,
       NULL::VARCHAR AS prompt_version,
       min(start_time) AS started_at,
       max(end_time) AS ended_at,
       min(start_time)::DATE AS trace_date,
       date_diff('millisecond', min(start_time), max(end_time)) AS duration_ms,
       count(*) AS span_count,
       count(*) FILTER (WHERE gen_ai_operation_name = 'execute_tool') AS tool_call_count,
       0::BIGINT AS retry_count,
       count(*) FILTER (WHERE gen_ai_operation_name = 'execute_tool' AND status_code = 'ERROR') AS tool_error_count,
       sum(input_tokens)::BIGINT AS total_input_tokens,
       sum(output_tokens)::BIGINT AS total_output_tokens,
       sum(llm_cost_micros)::BIGINT AS llm_cost_micros,
       sum(tool_cost_micros)::BIGINT AS tool_cost_micros,
       max(status_code) FILTER (WHERE parent_span_id IS NULL) AS root_status_code,
       CASE WHEN max(status_code) FILTER (WHERE parent_span_id IS NULL) = 'ERROR' THEN 'failed'
            ELSE 'completed' END AS outcome,
       NULL::BIGINT AS human_cost_cents
FROM {p}spans
GROUP BY trace_id
"""


def _bigint(otel_id: int | None) -> int | None:
    # OTel ids are 64 or 128 bits. The gallery schema stores BIGINT, so keep the low 63 bits.
    return otel_id & 0x7FFFFFFFFFFFFFFF if otel_id else None


def _ts(ns: int | None) -> datetime | None:
    return datetime.fromtimestamp(ns / 1e9, tz=timezone.utc).replace(tzinfo=None) if ns else None


def case_id(question: str | None) -> int | None:
    # Same question, same case: runs of one question line up as a case journey in the Dive.
    return int(hashlib.sha1(question.strip().lower().encode()).hexdigest()[:15], 16) if question else None


class MotherDuckSpanExporter(SpanExporter):
    """Writes finished spans as rows. Runs in the BatchSpanProcessor thread, never on stdout."""

    def __init__(self, target: str) -> None:
        self.target = target
        self.con = None
        self.prefix = ""

    def _connect(self) -> None:
        import duckdb

        if self.target.startswith("md:"):
            database = self.target[3:] or "workshop_traces"
            con = duckdb.connect("md:")
            con.execute(f"CREATE DATABASE IF NOT EXISTS {database}")
            self.prefix = f"{database}.main."
        else:
            con = duckdb.connect(self.target)
        cols = ", ".join(f"{name} {kind}" for name, kind in COLUMNS)
        con.execute(f"CREATE TABLE IF NOT EXISTS {self.prefix}spans ({cols})")
        con.execute(AGENT_TRACES.format(p=self.prefix))
        self.con = con

    def _row(self, span: ReadableSpan) -> tuple:
        a = dict(span.attributes or {})
        ctx = span.get_span_context()
        question = a.get("workshop.question")
        cost = a.get("workshop.llm_cost_usd")
        return (
            _bigint(ctx.trace_id),
            _bigint(ctx.span_id),
            _bigint(span.parent.span_id if span.parent else None),
            case_id(question),
            span.name,
            a.get("gen_ai.operation.name"),
            a.get("gen_ai.agent.name"),
            a.get("gen_ai.request.model"),
            a.get("gen_ai.tool.name"),
            a.get("gen_ai.tool.call.id"),
            _ts(span.start_time),
            _ts(span.end_time),
            round((span.end_time - span.start_time) / 1e6) if span.end_time and span.start_time else None,
            span.status.status_code.name,
            a.get("error.type"),
            a.get("workshop.tool_result_status"),
            a.get("gen_ai.usage.input_tokens"),
            a.get("gen_ai.usage.output_tokens"),
            1,
            round(cost * 1_000_000) if isinstance(cost, (int, float)) else None,
            None,
            span.resource.attributes.get("service.name"),
            question,
            a.get("db.query.text"),
        )

    def export(self, spans: Sequence[ReadableSpan]) -> SpanExportResult:
        try:
            if self.con is None:
                self._connect()
            marks = ", ".join("?" for _ in COLUMNS)
            self.con.executemany(f"INSERT INTO {self.prefix}spans VALUES ({marks})", [self._row(s) for s in spans])
            return SpanExportResult.SUCCESS
        except Exception as error:  # a broken trace store must never break the agent
            print(f"trace export failed: {error}"[:300], file=sys.stderr)
            return SpanExportResult.FAILURE

    def shutdown(self) -> None:
        if self.con is not None:
            self.con.close()


def setup(service_name: str) -> Tracer:
    """A tracer for this process. Without TRACE_TO_MOTHERDUCK=1 its spans go nowhere."""
    provider = TracerProvider(resource=Resource.create({"service.name": service_name}))
    if ENABLED:
        # Export every second, not only at exit: a server stopped with SIGTERM skips atexit.
        provider.add_span_processor(BatchSpanProcessor(MotherDuckSpanExporter(TARGET), schedule_delay_millis=1000))
        atexit.register(provider.shutdown)
    return provider.get_tracer("agentic-analytics-workshop")


@contextmanager
def tool_span(tracer: Tracer, tool: str, question: str | None = None, sql: str | None = None,
              call_id: str | None = None) -> Iterator[Span]:
    """One execute_tool span. Mark the outcome with finish_tool(span, ok)."""
    with tracer.start_as_current_span(f"execute_tool {tool}") as span:
        span.set_attribute("gen_ai.operation.name", "execute_tool")
        span.set_attribute("gen_ai.tool.name", tool)
        if call_id:
            span.set_attribute("gen_ai.tool.call.id", call_id)
        if question:
            span.set_attribute("workshop.question", question)
        if sql:
            span.set_attribute("db.query.text", sql)
        yield span


@contextmanager
def agent_span(tracer: Tracer, agent: str, model: str, question: str) -> Iterator[Span]:
    """The root span of one agent run. Close it with ok(span) or fail(span, reason)."""
    with tracer.start_as_current_span(f"invoke_agent {agent}") as span:
        span.set_attribute("gen_ai.operation.name", "invoke_agent")
        span.set_attribute("gen_ai.agent.name", agent)
        span.set_attribute("gen_ai.request.model", model)
        span.set_attribute("workshop.question", question)
        yield span


def ok(span: Span) -> None:
    span.set_status(Status(StatusCode.OK))


def fail(span: Span, reason: str) -> None:
    span.set_attribute("error.type", reason)
    span.set_status(Status(StatusCode.ERROR, reason))


def finish_tool(span: Span, ok: bool, error: str | None = None) -> None:
    span.set_attribute("workshop.tool_result_status", "success" if ok else "error")
    if ok:
        span.set_status(Status(StatusCode.OK))
    else:
        span.set_attribute("error.type", error or "tool_error")
        span.set_status(Status(StatusCode.ERROR, error))


def usage(span: Span, data: dict[str, Any]) -> None:
    """Token counts and cost from an OpenRouter chat completion's usage object."""
    u = data.get("usage") or {}
    if u.get("prompt_tokens") is not None:
        span.set_attribute("gen_ai.usage.input_tokens", int(u["prompt_tokens"]))
    if u.get("completion_tokens") is not None:
        span.set_attribute("gen_ai.usage.output_tokens", int(u["completion_tokens"]))
    if isinstance(u.get("cost"), (int, float)):
        span.set_attribute("workshop.llm_cost_usd", float(u["cost"]))
