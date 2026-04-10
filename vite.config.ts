import type { UserConfig } from "vite";
import sassDts from "vite-plugin-sass-dts";

export default {
  plugins: [
    sassDts({
      legacyFileFormat: true,
    }),
  ],

  esbuild: {
    jsx: "transform",
    jsxFactory: "createElement",
    jsxFragment: "createFragment",
    jsxInject:
      "import { createElement, createFragment } from '@cascateer/core'",
  },

  base: "/demo/",

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
