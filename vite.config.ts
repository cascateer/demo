import type { UserConfig } from "vite";
import sassDts from "vite-plugin-sass-dts";

export default {
  plugins: [
    sassDts({
      legacyFileFormat: true,
    }),
  ],

  base: "./",

  esbuild: {
    jsx: "transform",
    jsxFactory: "createElement",
    jsxFragment: "createFragment",
    jsxInject:
      "import { createElement, createFragment } from '@cascateer/core'",
  },

  server: {
    port: 2402,
  },

  css: {
    modules: {
      scopeBehaviour: "local",
      localsConvention: "camelCaseOnly",
    },
  },
} satisfies UserConfig;
