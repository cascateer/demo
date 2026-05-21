import type { UserConfig } from "vite";
import sassDts from "vite-plugin-sass-dts";

export default {
  plugins: [
    sassDts({
      legacyFileFormat: true,
    }),
  ],

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

  build: {
    rollupOptions: {
      external: ["/node_modules/@cascateer/core/src/serializable.ts"],
    },
  },
} satisfies UserConfig;
