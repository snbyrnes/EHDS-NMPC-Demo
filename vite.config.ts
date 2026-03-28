import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/EHDS-NMPC-Demo/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
