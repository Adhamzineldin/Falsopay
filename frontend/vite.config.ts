import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 5000,
    allowedHosts: ['*'], // ← safe toggle
    proxy: {
      // This will forward requests from your Vite development server to your backend API
      '/api': 'https://app4000.maayn.me',  // Change to your backend's API URL
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

