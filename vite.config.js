import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    createVuePlugin({
      vueTemplateOptions: {},
      jsx: true,
      jsxOptions: {
        compositionAPI: true,
      },
    }),
    cssInjectedByJsPlugin({ topExecutionPriority: false }),
  ],
  server: {
    port: "3000",
    host: "0.0.0.0",
  },
  build: {
    outDir: "lib",
    lib: {
      entry: "./src/index.ts",
      name: "WordComment",
      fileName: "index",
    },
    rollupOptions: {
      external: ["vue", "@vue/composition-api", 'vue-demi'],
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
