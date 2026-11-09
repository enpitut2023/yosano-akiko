# Migrate to SvelteKit 3

Based on the [migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
and a blank `sv create` project. `npx sv migrate sveltekit-3` automates part
of this; run it after the package bumps and review what it changes.

Nothing here uses `$app/stores`, `base`, `resolveRoute`, `goto`,
`invalidateAll`, hooks, `+server` routes, `src/params`, a service worker or
`data-sveltekit-*="off"`, so those parts of the guide don't apply.

## Packages

- [x] `@sveltejs/kit` ^3 and `@sveltejs/adapter-static` ^4 (3.x doesn't
      support Kit 3).
- [x] `typescript` ^6. Not 7: Kit 3's peer range is `^6.0.0`, and npm's
      `latest` is 7.
- [x] Raise the floors of `svelte` (≥ 5.57.1) and `vite` (≥ 8.0.12).
- [x] Kit 3 needs Node ≥ 22.17. Neither workflow in `.github/workflows/`
      runs `setup-node`, so CI uses whatever the runner ships. Add it with
      a pinned version.

## Config

- [x] `svelte.config.js` is no longer read. Move it into `sveltekit({...})`
      in `vite.config.ts`, with the `kit.*` options going top-level
      (adapter, `outDir`, `paths`), plus `compilerOptions.warningFilter`.
      The `AKIKO_E2E` flag already lives in `vite.config.ts`, so the two
      merge. Update the comments that point at `svelte.config.js`, e.g. in
      `eslint.config.js`.
  - svelte-check below 4.7 doesn't read `warningFilter` from the Vite
    config, so it's bumped to ^4.7.8.
- [x] The template drops `preprocess: vitePreprocess()`. vite-plugin-svelte 7
      adds no preprocessor by default, so it stays, for the SCSS.
  - [x] Confirm the SCSS still compiles once `npm run build` runs again.
- [x] `tsconfig.json` extends `"$app/tsconfig"` and lists `include` and
      `exclude` itself. Remove the options the base already sets. The base
      turns on `verbatimModuleSyntax` and `isolatedModules`, and
      svelte-check found no errors with both enabled on the current code.
- [x] `version.pollInterval` now defaults to one hour, so the site polls
      `_app/version.json`. Set it to 0 unless we want that.
  - Kit still checks for a new version when the tab regains focus, and
    that can't be turned off.

## Code

`npx sv migrate sveltekit-3` reprints Svelte markup, which changes rendered
whitespace (spaces around the tab labels) and moved the doc comments in
`RequirementsTable`'s props away from their props. So it was discarded, and
these were done with a script instead.

- [x] `$lib` → `#lib`: 224 imports in 80 files. Add the `imports` map to
      `package.json` (`"#lib": "./src/lib/index.js"`,
      `"#lib/*": "./src/lib/*"`), and give each import its file extension
      (`#lib/akiko.ts`).
  - Only `#lib/*` is mapped: there's no `src/lib/index.ts`.
  - [x] `src/routes/+layout.svelte` has `@use "$lib/fonts.scss"`. Sass
        doesn't resolve `#lib`, so use a relative path.
  - [x] `.claude/skills/snapshot-refactor/scripts/snapshot.test.ts`.
  - [ ] Whatever generates `src/lib/current-courses.ts` must now write
        `import type { KnownCourse } from "#lib/akiko.ts";`.
- [x] `$app/environment` → `$app/env` in `ContactEmail.svelte`,
      `+layout.svelte` and `MajorApp.svelte`.
- [x] `asset()` takes paths without a leading `/`
      (`asset("images/akiko.png")`), about 20 calls, including
      `major-config.ts`. `resolve()` calls stay as they are, since they
      take route IDs.
  - `asset()` now only takes a path of a file in `static/`. `Dialog`'s
    `image` and the top page's `features` are typed `AssetPath`; the table
    and rects paths go through `assetBuiltAtRuntime` in `major-config.ts`.

## Optional, from the template

- [ ] `prettier-plugin-svelte` 4, and `prettier` as a direct
      devDependency (only the plugin is listed now).
- [ ] `compilerOptions.runes` to force runes mode outside `node_modules`.
- [ ] `engine-strict=true` in `.npmrc`.

## Finish

- [x] `npm run verify` passes.
- [x] Screenshots match the ones from before the migration (90f3743 added
      the code; the four `screenshots/before-*` runs are untracked):
      `for i in 1 2 3; do SHOTS=screenshots/after-$i npx playwright test; done`,
      then `python3 tests/e2e/compare-shots.py screenshots`.
- [ ] Revert 90f3743 and delete `screenshots/`.
- [x] Update `CLAUDE.md` where it mentions anything changed above. Nothing
      in it was out of date.
