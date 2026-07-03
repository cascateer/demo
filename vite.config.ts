import { defineConfig, loadEnv } from "vite";
import sassDts from "vite-plugin-sass-dts";

export default defineConfig(({ mode }) => {
  const { VITE_HOST, VITE_PORT } = loadEnv(mode, process.cwd());

  return {
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

    resolve: {
      alias: {
        "@cascateer/test": "/test",
      },
    },

    server: {
      host: VITE_HOST,
      port: VITE_PORT != null ? +VITE_PORT : void 0,
    },
  };
});
