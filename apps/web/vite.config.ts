import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from 'vite-plugin-compression';
import path from "path";

export default defineConfig(() => ({
  plugins: [react(), viteCompression()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
