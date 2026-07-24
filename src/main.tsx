import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  // SW unter dem Basis-Pfad registrieren (funktioniert auf GH-Pages-Unterpfad und lokal)
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
}
