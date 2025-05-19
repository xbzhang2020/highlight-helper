import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin({ topExecutionPriority: false })],
  server: {
    port: "3000",
    host: "0.0.0.0",
  },
  build: {
    outDir: "dist",
    lib: {
      entry: "./src/index.ts",
      name: "WordComment",
      fileName: "index",
    },
    rollupOptions: {
      external: ["vue", "@vue/composition-api", "vue-demi"],
      output: {
        globals: {
          vue: "Vue",
          "@vue/composition-api": "VueCompositionAPI",
          "vue-demi": "vueDemi",
        },
        exports: "named",
      },
    },
  },
});
