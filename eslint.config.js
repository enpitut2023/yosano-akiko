import prettier from "eslint-config-prettier";
import path from "node:path";
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  { ignores: ["src/lib/current-courses.ts", "src/lib/rects/"] },
  js.configs.recommended,
  ts.configs.recommendedTypeChecked,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        // The config files at the repo root are outside tsconfig.json's include.
        projectService: { allowDefaultProject: ["*.js"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      "no-undef": "off",
      // Japanese comments use full-width spaces.
      "no-irregular-whitespace": ["error", { skipComments: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
      },
    },
  },
  {
    files: ["**/*.svelte"],
    rules: {
      // Every href in this codebase that skips resolve() points at an external
      // site, which the rule cannot tell apart from an unresolved internal link.
      "svelte/no-navigation-without-resolve": ["error", { ignoreLinks: true }],
      // Flags every plain Map/Set, including the ones built and thrown away
      // inside a $derived, which never need to be reactive.
      "svelte/prefer-svelte-reactivity": "off",
    },
  },
  {
    // svelte.config.js filters a11y warnings out of the compiler, so the
    // matching lint rules would reintroduce them.
    rules: Object.fromEntries(
      Object.keys(svelte.rules)
        .filter((name) => name.startsWith("a11y-"))
        .map((name) => [`svelte/${name}`, "off"]),
    ),
  },
);
