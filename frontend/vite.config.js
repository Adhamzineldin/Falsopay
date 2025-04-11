import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Makes it accessible on all network interfaces
    port: 5173,        // You can specify the port here, or leave it as default
  },
})
