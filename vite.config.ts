import { resolve } from "path";
import type { UserConfig } from "vite";
import sassDts from "vite-plugin-sass-dts";

export default {
  plugins: [
    sassDts({
      legacyFileFormat: true,
    }),
  ],

  resolve: {
    alias: {
      "@sterio": resolve(__dirname, "../sterio/api"),
    },
  },

  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "@cascateer/core",
    },
  },

  css: {
    modules: {
      scopeBehaviour: "local",
      localsConvention: "camelCaseOnly",
    },
  },

  server: {
    port: 4173,
  },
} satisfies UserConfig;
