import path from "path";
import { defineConfig } from "vite";
export default defineConfig({
  resolve: {
    alias: {
      "@news-app/core": path.resolve("./packages/core/src")
    },
    testTimeOut: 10000
  },
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // global: true
  },
  
});
