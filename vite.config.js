import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const isProduction = process.env.NODE_ENV === 'production'

// https://vite.dev/config/
export default defineConfig({
  base: isProduction ? '/Amynabadscoutsgroup/' : '/',
  plugins: [react(), tailwindcss()],
})