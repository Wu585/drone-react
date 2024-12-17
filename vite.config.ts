import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {svgsprites} from "./vite_plugins/svgsprites";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    svgsprites()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/wsApi':{
        target: 'http://36.152.38.220:8888/',
        // target: 'http://192.168.31.101:8100/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wsApi/, ""),
      },
      '/iPortal':{
        target: 'http://36.152.38.212:8190/',
        // target: 'http://192.168.31.101:8100/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/iPortal/, ""),
      },
      '/test':{
        target: 'http://36.152.38.220:8100/',
        // target: 'http://192.168.31.101:8100/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/test/, ""),
      },
      '/iServerApi': {
        target: 'http://36.139.117.52:8090/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/iServerApi/, ""),
      },
      '/weatherApi': {
        target: 'http://aider.meizu.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/weatherApi/, ""),
      },
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('echarts')) {
            return 'echarts'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
});
