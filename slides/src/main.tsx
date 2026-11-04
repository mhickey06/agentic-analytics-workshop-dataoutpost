import React from 'react'
import { createRoot } from 'react-dom/client'
import Deck from './Deck'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Deck />
  </React.StrictMode>
)
