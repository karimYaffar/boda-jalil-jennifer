
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [tailwindcss()],

  build: {
    rolldownOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        main: resolve(import.meta.dirname, 'main.html'),
        confirmacion: resolve(import.meta.dirname, 'confirmacion.html')
      }
    }
  }
})


