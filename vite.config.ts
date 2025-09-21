// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
// The `mode` parameter allows us to check for the 'analyze' script
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Conditional addition of the visualizer plugin
    // It will only be included when you run the 'analyze' script (mode === 'analyze')
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html', // Output file location
      open: true,                 // Automatically open report
      gzipSize: true,             // Show gzip size in the report
    }),
  ].filter(Boolean), // .filter(Boolean) removes the 'false' entry when not analyzing

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));