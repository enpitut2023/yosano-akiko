import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { env } from "node:process";

const release = (env.AKIKO_RELEASE ?? "") !== "";

await esbuild.build({
  entryPoints: [
    "src/2021/coins/index.ts",
    "src/2021/mast/index.ts",
    "src/2022/coins/index.ts",
    "src/2023/coins/index.ts",
    "src/2023/klis-science/index.ts",
    "src/2023/klis-system/index.ts",
    "src/2023/mast/index.ts",
    "src/2024/coins/index.ts",
    "src/2025/coins/index.ts",

    "src/app.scss",
    "src/styles.scss",
  ],
  outbase: "src",
  bundle: true,
  outdir: "dist",
  target: "es6",
  format: "iife",
  charset: "utf8",
  logLevel: "info",
  external: ["fonts/*"],
  plugins: [sassPlugin()],
  sourcemap: release ? undefined : "inline",
  minify: release,
});
