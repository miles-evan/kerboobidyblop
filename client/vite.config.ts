import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // deployed under kevdarby.com/kerboobidyblop/ (nginx proxies this path to the game server)
  base: "/kerboobidyblop/",
})
