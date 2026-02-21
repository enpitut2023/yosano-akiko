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
      "src/2023/coins-cs/index.ts",
      "src/2023/coins-mimt/index.ts",
      "src/2023/klis-science/index.ts",
      "src/2023/klis-system/index.ts",
      "src/2023/klis-rm/index.ts",
      "src/2023/mast/index.ts",
      "src/2023/math/index.ts",
      "src/2023/physics/index.ts",
      "src/2023/esys-ies/index.ts",
      "src/2023/esys-eme/index.ts",
      "src/2023/coens-ap/index.ts",
      "src/2023/coens-eqe/index.ts",
      "src/2023/coens-mse/index.ts",
      "src/2023/coens-mme/index.ts",
      "src/2023/pops-ses/index.ts",
      "src/2023/pops-mse/index.ts",
      "src/2023/pops-urp/index.ts",
      "src/2023/chem/index.ts",
      "src/2023/jpjp/index.ts",
      "src/2023/jpjp-jltt/index.ts",
      "src/2023/ccc/index.ts",
      "src/2023/earth-gs/index.ts",
      "src/2023/earth-ees/index.ts",
      "src/2023/edu/index.ts",
      "src/2023/cis-ir/index.ts",
      "src/2023/cis-id/index.ts",

      "src/2024/coins/index.ts",
      "src/2024/coins-cs/index.ts",
      "src/2024/coins-mimt/index.ts",
      "src/2024/klis-science/index.ts",
      "src/2024/klis-system/index.ts",
      "src/2024/klis-rm/index.ts",
      "src/2024/mast/index.ts",
      "src/2024/math/index.ts",
      "src/2024/physics/index.ts",
      "src/2024/esys-ies/index.ts",
      "src/2024/esys-eme/index.ts",
      "src/2024/coens-ap/index.ts",
      "src/2024/coens-eqe/index.ts",
      "src/2024/coens-mse/index.ts",
      "src/2024/coens-mme/index.ts",
      "src/2024/pops-ses/index.ts",
      "src/2024/pops-mse/index.ts",
      "src/2024/pops-urp/index.ts",
      "src/2024/chem/index.ts",
      "src/2024/jpjp/index.ts",
      "src/2024/jpjp-jltt/index.ts",
      "src/2024/ccc/index.ts",
      "src/2024/earth-gs/index.ts",
      "src/2024/earth-ees/index.ts",
      "src/2024/edu/index.ts",
      "src/2024/cis-ir/index.ts",
      "src/2024/cis-id/index.ts",

      "src/2025/coins/index.ts",
      "src/2025/coins-cs/index.ts",
      "src/2025/coins-mimt/index.ts",
      "src/2025/klis-science/index.ts",
      "src/2025/klis-system/index.ts",
      "src/2025/klis-rm/index.ts",
      "src/2025/mast/index.ts",
      "src/2025/math/index.ts",
      "src/2025/physics/index.ts",
      "src/2025/esys-ies/index.ts",
      "src/2025/esys-eme/index.ts",
      "src/2025/coens-ap/index.ts",
      "src/2025/coens-eqe/index.ts",
      "src/2025/coens-mse/index.ts",
      "src/2025/coens-mme/index.ts",
      "src/2025/pops-ses/index.ts",
      "src/2025/pops-mse/index.ts",
      "src/2025/pops-urp/index.ts",
      "src/2025/chem/index.ts",
      "src/2025/jpjp/index.ts",
      "src/2025/jpjp-jltt/index.ts",
      "src/2025/ccc/index.ts",
      "src/2025/earth-gs/index.ts",
      "src/2025/earth-ees/index.ts",
      "src/2025/edu/index.ts",
      "src/2025/cis-ir/index.ts",
      "src/2025/cis-id/index.ts",

      "src/app.scss",
      "src/styles.scss",
      "src/docs/styles.scss",
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
