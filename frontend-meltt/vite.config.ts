import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 9001
    },
  plugins: [ react()],
  optimizeDeps: {
    include: [
      'date-fns/format',
      'date-fns/parse',
      'date-fns/addDays',
      'date-fns/startOfWeek',
      'date-fns/getDay',
      'date-fns/locale/pt-BR'
    ]
  }
})
