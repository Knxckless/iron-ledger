import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Projekt-Seite auf GitHub Pages liegt unter /iron-ledger/
  base: '/iron-ledger/',
  plugins: [react(), tailwindcss()],
})
