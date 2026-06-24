import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.tsx'
// Add once in your app entry (e.g. layout.tsx, _app.tsx, main.tsx)
import './bones/registry';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
