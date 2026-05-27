import { readFileSync } from "fs";
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

  server: {
    port: 4173,
    https: {
      pfx: readFileSync("./ssl.pfx"),
      passphrase: "passphrase",
    },
  },
} satisfies UserConfig;
