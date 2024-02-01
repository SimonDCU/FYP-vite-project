import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  server: { https: true },
  base: '/FYP-vite-project/',
  plugins: [ mkcert() ],
})