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
    "src/2021/coins/styles.css",
    "src/2021/mast/styles.css",
    "src/2022/coins/styles.css",
    "src/2023/coins/styles.css",
    "src/2023/klis-science/styles.css",
    "src/2023/klis-system/styles.css",
    "src/2023/mast/styles.css",
    "src/2024/coins/styles.css",
    "src/2025/coins/styles.css",
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
