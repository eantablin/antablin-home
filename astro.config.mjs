// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// The hub is served from a custom domain at the root (www.antablin.com).
// `site` powers canonical URLs + the generated sitemap.
export default defineConfig({
  site: "https://www.antablin.com",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
});
