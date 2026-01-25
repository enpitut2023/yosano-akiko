// @ts-check
import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { env } from "node:process";

/**
 * @param {boolean} b
 * @returns {string}
 */
function booleanToString(b) {
  return b ? "true" : "false";
}

async function main() {
  const release = (env.AKIKO_RELEASE ?? "") !== "";
  const watch = process.argv.includes("--watch");

  /** @type {esbuild.BuildOptions} */
  const options = {
    entryPoints: [
      "src/2021/coins/index.ts",
      "src/2021/mast/index.ts",

      "src/2022/coins/index.ts",

      "src/2023/coins/index.ts",
      "src/2023/klis-science/index.ts",
      "src/2023/klis-system/index.ts",
      "src/2023/mast/index.ts",
      "src/2023/physics/index.ts",
      "src/2023/coens-ap/index.ts",
      "src/2023/coens-eqe/index.ts",
      "src/2023/coens-mme/index.ts",
      "src/2023/coens-mse/index.ts",

      "src/2024/coins/index.ts",
      "src/2024/math/index.ts",
      "src/2024/physics/index.ts",
      "src/2024/coens-ap/index.ts",
      "src/2024/coens-eqe/index.ts",
      "src/2024/coens-mme/index.ts",
      "src/2024/coens-mse/index.ts",

      "src/2025/coins/index.ts",
      "src/2025/math/index.ts",
      "src/2025/physics/index.ts",
      "src/2025/coens-ap/index.ts",
      "src/2025/coens-eqe/index.ts",
      "src/2025/coens-mme/index.ts",
      "src/2025/coens-mse/index.ts",

      "src/app.scss",
      "src/styles.scss",
      "src/docs/help.scss",
    ],
    outbase: "src",
    bundle: true,
    loader: { ".svg": "dataurl" },
    outdir: "dist",
    target: "es6",
    format: "iife",
    charset: "utf8",
    logLevel: "info",
    external: ["*.ttf"],
    plugins: [sassPlugin()],
    sourcemap: release ? undefined : "inline",
    minify: release,
    define: { DEBUG: booleanToString(!release) },
  };

  if (watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
}

main();
