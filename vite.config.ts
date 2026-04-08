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
    jsxFactory: "jsx.createElement",
    jsxFragment: "jsx.createFragment",
    jsxInject: "import { jsx } from '@cascateer/core'",
  },

  server: {
    port: 2402,
    fs: {
      allow: ["C:/Users/aak/repos/cascateer/demo"],
    },
  },

  css: {
    modules: {
      scopeBehaviour: "local",
      localsConvention: "camelCaseOnly",
    },
  },
} satisfies UserConfig;
