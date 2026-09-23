import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // The repo has a single .env at the root; only VITE_* keys from it are
  // exposed to the browser bundle.
  envDir: path.resolve(__dirname, "../.."),
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
   server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000", 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
