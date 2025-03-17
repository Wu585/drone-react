// vite.config.ts
import { defineConfig } from "file:///D:/work/codes/drone-react/node_modules/vite/dist/node/index.js";
import react from "file:///D:/work/codes/drone-react/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path2 from "path";

// vite_plugins/svgsprites.ts
import path from "path";
import fs from "fs";
import store from "file:///D:/work/codes/drone-react/node_modules/svgstore/src/svgstore.js";
import { optimize } from "file:///D:/work/codes/drone-react/node_modules/svgo/lib/svgo-node.js";
var svgsprites = (options = {}) => {
  const virtualModuleId = `virtual:svgsprites${options.id ? `-${options.id}` : ""}`;
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;
  const { inputFolder = "src/assets/icons", inline = false } = options;
  console.log("inputFolder");
  console.log(inputFolder);
  const generateCode = () => {
    const sprites = store(options);
    const iconsDir = path.resolve(inputFolder);
    for (const file of fs.readdirSync(iconsDir)) {
      if (!file.endsWith(".svg")) {
        continue;
      }
      const filepath = path.join(iconsDir, file);
      const svgId = path.parse(file).name;
      const code = fs.readFileSync(filepath, { encoding: "utf-8" });
      const symbol = options.noOptimizeList?.includes(svgId) ? code : optimize(code, {
        plugins: [
          "cleanupAttrs",
          "removeDoctype",
          "removeComments",
          "removeTitle",
          "removeDesc",
          "removeEmptyAttrs",
          { name: "removeAttrs", params: { attrs: "(data-name|fill)" } }
        ]
      }).data;
      sprites.add(svgId, symbol);
    }
    return sprites.toString({ inline });
  };
  const handleFileCreationOrUpdate = (file, server) => {
    if (!file.includes(inputFolder)) {
      return;
    }
    const code = generateCode();
    server.ws.send("svgsprites:change", { code });
    const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
    if (!mod) {
      return;
    }
    server.moduleGraph.invalidateModule(mod, void 0, Date.now());
  };
  return {
    name: "svgsprites",
    configureServer(server) {
      server.watcher.on("add", (file) => {
        handleFileCreationOrUpdate(file, server);
      });
      server.watcher.on("change", (file) => {
        handleFileCreationOrUpdate(file, server);
      });
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const code = generateCode();
        return `!function(){
  const div = document.createElement('div')
  div.innerHTML = \`${code}\`
  const svg = div.getElementsByTagName('svg')[0]
  const updateSvg = (svg) => {
    if (!svg) { return }
    svg.style.position = 'absolute'
    svg.style.width = 0
    svg.style.height = 0
    svg.style.overflow = 'hidden'
    svg.setAttribute("aria-hidden", "true")
  }
  const insert = () => {
    if (document.body.firstChild) {
      document.body.insertBefore(div, document.body.firstChild)
    } else {
      document.body.appendChild(div)
    }
  }
  updateSvg(svg)
  if (document.body){
    insert()
  } else {
    document.addEventListener('DOMContentLoaded', insert)
  }
  if (import.meta.hot) {
    import.meta.hot.on('svgsprites:change', (data) => {
      const code = data.code
      div.innerHTML = code
      const svg = div.getElementsByTagName('svg')[0]
      updateSvg(svg)
    })
  }
}()`;
      }
    }
  };
};

// vite.config.ts
var __vite_injected_original_dirname = "D:\\work\\codes\\drone-react";
var vite_config_default = defineConfig({
  base: "./",
  plugins: [
    react(),
    svgsprites()
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    proxy: {
      "/wsApi": {
        target: "http://36.152.38.220:8888/",
        // target: 'http://192.168.31.101:8100/',
        changeOrigin: true,
        rewrite: (path3) => path3.replace(/^\/wsApi/, "")
      },
      "/iPortal": {
        target: "http://36.152.38.212:8190/",
        // target: 'http://192.168.31.101:8100/',
        changeOrigin: true,
        rewrite: (path3) => path3.replace(/^\/iPortal/, "")
      },
      "/test": {
        target: "http://36.152.38.220:8100/",
        // target: 'http://192.168.31.101:8100/',
        changeOrigin: true,
        rewrite: (path3) => path3.replace(/^\/test/, "")
      },
      "/iServerApi": {
        target: "http://36.139.117.52:8090/",
        changeOrigin: true,
        rewrite: (path3) => path3.replace(/^\/iServerApi/, "")
      },
      "/weatherApi": {
        target: "http://aider.meizu.com/",
        changeOrigin: true,
        rewrite: (path3) => path3.replace(/^\/weatherApi/, "")
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("echarts")) {
            return "echarts";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZV9wbHVnaW5zL3N2Z3Nwcml0ZXMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3JrXFxcXGNvZGVzXFxcXGRyb25lLXJlYWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3b3JrXFxcXGNvZGVzXFxcXGRyb25lLXJlYWN0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93b3JrL2NvZGVzL2Ryb25lLXJlYWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHtkZWZpbmVDb25maWd9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHtzdmdzcHJpdGVzfSBmcm9tIFwiLi92aXRlX3BsdWdpbnMvc3Znc3ByaXRlc1wiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiBcIi4vXCIsXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIHN2Z3Nwcml0ZXMoKVxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL3dzQXBpJzp7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzM2LjE1Mi4zOC4yMjA6ODg4OC8nLFxyXG4gICAgICAgIC8vIHRhcmdldDogJ2h0dHA6Ly8xOTIuMTY4LjMxLjEwMTo4MTAwLycsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC93c0FwaS8sIFwiXCIpLFxyXG4gICAgICB9LFxyXG4gICAgICAnL2lQb3J0YWwnOntcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMzYuMTUyLjM4LjIxMjo4MTkwLycsXHJcbiAgICAgICAgLy8gdGFyZ2V0OiAnaHR0cDovLzE5Mi4xNjguMzEuMTAxOjgxMDAvJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2lQb3J0YWwvLCBcIlwiKSxcclxuICAgICAgfSxcclxuICAgICAgJy90ZXN0Jzp7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzM2LjE1Mi4zOC4yMjA6ODEwMC8nLFxyXG4gICAgICAgIC8vIHRhcmdldDogJ2h0dHA6Ly8xOTIuMTY4LjMxLjEwMTo4MTAwLycsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC90ZXN0LywgXCJcIiksXHJcbiAgICAgIH0sXHJcbiAgICAgICcvaVNlcnZlckFwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMzYuMTM5LjExNy41Mjo4MDkwLycsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9pU2VydmVyQXBpLywgXCJcIiksXHJcbiAgICAgIH0sXHJcbiAgICAgICcvd2VhdGhlckFwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vYWlkZXIubWVpenUuY29tLycsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC93ZWF0aGVyQXBpLywgXCJcIiksXHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZWNoYXJ0cycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnZWNoYXJ0cydcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3JrXFxcXGNvZGVzXFxcXGRyb25lLXJlYWN0XFxcXHZpdGVfcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcd29ya1xcXFxjb2Rlc1xcXFxkcm9uZS1yZWFjdFxcXFx2aXRlX3BsdWdpbnNcXFxcc3Znc3ByaXRlcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovd29yay9jb2Rlcy9kcm9uZS1yZWFjdC92aXRlX3BsdWdpbnMvc3Znc3ByaXRlcy50c1wiO2ltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuLy8gQHRzLWlnbm9yZVxyXG5pbXBvcnQgc3RvcmUgZnJvbSBcInN2Z3N0b3JlXCI7XHJcbmltcG9ydCB7b3B0aW1pemV9IGZyb20gXCJzdmdvXCI7XHJcbmltcG9ydCB0eXBlIHtQbHVnaW4sIFZpdGVEZXZTZXJ2ZXJ9IGZyb20gXCJ2aXRlXCI7XHJcblxyXG5pbnRlcmZhY2UgT3B0aW9ucyB7XHJcbiAgaWQ/OiBzdHJpbmc7XHJcbiAgaW5wdXRGb2xkZXI/OiBzdHJpbmc7XHJcbiAgaW5saW5lPzogYm9vbGVhbjtcclxuICBub09wdGltaXplTGlzdD86IHN0cmluZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3Qgc3Znc3ByaXRlcyA9IChvcHRpb25zOiBPcHRpb25zID0ge30pOiBQbHVnaW4gPT4ge1xyXG4gIGNvbnN0IHZpcnR1YWxNb2R1bGVJZCA9IGB2aXJ0dWFsOnN2Z3Nwcml0ZXMke29wdGlvbnMuaWQgPyBgLSR7b3B0aW9ucy5pZH1gIDogXCJcIn1gO1xyXG4gIGNvbnN0IHJlc29sdmVkVmlydHVhbE1vZHVsZUlkID0gYFxcMCR7dmlydHVhbE1vZHVsZUlkfWA7XHJcbiAgY29uc3Qge2lucHV0Rm9sZGVyID0gXCJzcmMvYXNzZXRzL2ljb25zXCIsIGlubGluZSA9IGZhbHNlfSA9IG9wdGlvbnM7XHJcblxyXG4gIGNvbnNvbGUubG9nKCdpbnB1dEZvbGRlcicpO1xyXG4gIGNvbnNvbGUubG9nKGlucHV0Rm9sZGVyKTtcclxuXHJcbiAgY29uc3QgZ2VuZXJhdGVDb2RlID0gKCkgPT4ge1xyXG4gICAgY29uc3Qgc3ByaXRlcyA9IHN0b3JlKG9wdGlvbnMpO1xyXG4gICAgY29uc3QgaWNvbnNEaXIgPSBwYXRoLnJlc29sdmUoaW5wdXRGb2xkZXIpO1xyXG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZzLnJlYWRkaXJTeW5jKGljb25zRGlyKSkge1xyXG4gICAgICBpZiAoIWZpbGUuZW5kc1dpdGgoXCIuc3ZnXCIpKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgZmlsZXBhdGggPSBwYXRoLmpvaW4oaWNvbnNEaXIsIGZpbGUpO1xyXG4gICAgICBjb25zdCBzdmdJZCA9IHBhdGgucGFyc2UoZmlsZSkubmFtZTtcclxuICAgICAgY29uc3QgY29kZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlcGF0aCwge2VuY29kaW5nOiBcInV0Zi04XCJ9KTtcclxuICAgICAgY29uc3Qgc3ltYm9sID0gb3B0aW9ucy5ub09wdGltaXplTGlzdD8uaW5jbHVkZXMoc3ZnSWQpXHJcbiAgICAgICAgPyBjb2RlXHJcbiAgICAgICAgOiBvcHRpbWl6ZShjb2RlLCB7XHJcbiAgICAgICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgICAgIFwiY2xlYW51cEF0dHJzXCIsIFwicmVtb3ZlRG9jdHlwZVwiLCBcInJlbW92ZUNvbW1lbnRzXCIsIFwicmVtb3ZlVGl0bGVcIiwgXCJyZW1vdmVEZXNjXCIsIFwicmVtb3ZlRW1wdHlBdHRyc1wiLFxyXG4gICAgICAgICAgICB7bmFtZTogXCJyZW1vdmVBdHRyc1wiLCBwYXJhbXM6IHthdHRyczogXCIoZGF0YS1uYW1lfGZpbGwpXCJ9fSxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSkuZGF0YTtcclxuICAgICAgc3ByaXRlcy5hZGQoc3ZnSWQsIHN5bWJvbCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3ByaXRlcy50b1N0cmluZyh7aW5saW5lfSk7XHJcbiAgfTtcclxuICBjb25zdCBoYW5kbGVGaWxlQ3JlYXRpb25PclVwZGF0ZSA9IChmaWxlOiBzdHJpbmcsIHNlcnZlcjogVml0ZURldlNlcnZlcikgPT4ge1xyXG4gICAgaWYgKCFmaWxlLmluY2x1ZGVzKGlucHV0Rm9sZGVyKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBjb2RlID0gZ2VuZXJhdGVDb2RlKCk7XHJcbiAgICBzZXJ2ZXIud3Muc2VuZChcInN2Z3Nwcml0ZXM6Y2hhbmdlXCIsIHtjb2RlfSk7XHJcbiAgICBjb25zdCBtb2QgPSBzZXJ2ZXIubW9kdWxlR3JhcGguZ2V0TW9kdWxlQnlJZChyZXNvbHZlZFZpcnR1YWxNb2R1bGVJZCk7XHJcbiAgICBpZiAoIW1vZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzZXJ2ZXIubW9kdWxlR3JhcGguaW52YWxpZGF0ZU1vZHVsZShtb2QsIHVuZGVmaW5lZCwgRGF0ZS5ub3coKSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6IFwic3Znc3ByaXRlc1wiLFxyXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xyXG4gICAgICBzZXJ2ZXIud2F0Y2hlci5vbihcImFkZFwiLCAoZmlsZSkgPT4ge1xyXG4gICAgICAgIGhhbmRsZUZpbGVDcmVhdGlvbk9yVXBkYXRlKGZpbGUsIHNlcnZlcik7XHJcbiAgICAgIH0pO1xyXG4gICAgICBzZXJ2ZXIud2F0Y2hlci5vbihcImNoYW5nZVwiLCAoZmlsZSkgPT4ge1xyXG4gICAgICAgIGhhbmRsZUZpbGVDcmVhdGlvbk9yVXBkYXRlKGZpbGUsIHNlcnZlcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHJlc29sdmVJZChpZDogc3RyaW5nKSB7XHJcbiAgICAgIGlmIChpZCA9PT0gdmlydHVhbE1vZHVsZUlkKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc29sdmVkVmlydHVhbE1vZHVsZUlkO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgbG9hZChpZDogc3RyaW5nKSB7XHJcbiAgICAgIGlmIChpZCA9PT0gcmVzb2x2ZWRWaXJ0dWFsTW9kdWxlSWQpIHtcclxuICAgICAgICBjb25zdCBjb2RlID0gZ2VuZXJhdGVDb2RlKCk7XHJcbiAgICAgICAgcmV0dXJuIGAhZnVuY3Rpb24oKXtcclxuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gIGRpdi5pbm5lckhUTUwgPSBcXGAke2NvZGV9XFxgXHJcbiAgY29uc3Qgc3ZnID0gZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXVxyXG4gIGNvbnN0IHVwZGF0ZVN2ZyA9IChzdmcpID0+IHtcclxuICAgIGlmICghc3ZnKSB7IHJldHVybiB9XHJcbiAgICBzdmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICBzdmcuc3R5bGUud2lkdGggPSAwXHJcbiAgICBzdmcuc3R5bGUuaGVpZ2h0ID0gMFxyXG4gICAgc3ZnLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbidcclxuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIilcclxuICB9XHJcbiAgY29uc3QgaW5zZXJ0ID0gKCkgPT4ge1xyXG4gICAgaWYgKGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZCkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5Lmluc2VydEJlZm9yZShkaXYsIGRvY3VtZW50LmJvZHkuZmlyc3RDaGlsZClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KVxyXG4gICAgfVxyXG4gIH1cclxuICB1cGRhdGVTdmcoc3ZnKVxyXG4gIGlmIChkb2N1bWVudC5ib2R5KXtcclxuICAgIGluc2VydCgpXHJcbiAgfSBlbHNlIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbnNlcnQpXHJcbiAgfVxyXG4gIGlmIChpbXBvcnQubWV0YS5ob3QpIHtcclxuICAgIGltcG9ydC5tZXRhLmhvdC5vbignc3Znc3ByaXRlczpjaGFuZ2UnLCAoZGF0YSkgPT4ge1xyXG4gICAgICBjb25zdCBjb2RlID0gZGF0YS5jb2RlXHJcbiAgICAgIGRpdi5pbm5lckhUTUwgPSBjb2RlXHJcbiAgICAgIGNvbnN0IHN2ZyA9IGRpdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF1cclxuICAgICAgdXBkYXRlU3ZnKHN2ZylcclxuICAgIH0pXHJcbiAgfVxyXG59KClgO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH07XHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVEsU0FBUSxvQkFBbUI7QUFDaFMsT0FBTyxXQUFXO0FBQ2xCLE9BQU9BLFdBQVU7OztBQ0Yy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
