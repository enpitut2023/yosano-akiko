# Migrate to SvelteKit 3

Based on the [migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
and a blank `sv create` project. `npx sv migrate sveltekit-3` automates part
of this; run it after the package bumps and review what it changes.

Nothing here uses `$app/stores`, `base`, `resolveRoute`, `goto`,
`invalidateAll`, hooks, `+server` routes, `src/params`, a service worker or
`data-sveltekit-*="off"`, so those parts of the guide don't apply.

## Packages

- [ ] `@sveltejs/kit` ^3 and `@sveltejs/adapter-static` ^4 (3.x doesn't
      support Kit 3).
- [ ] `typescript` ^6. Not 7: Kit 3's peer range is `^6.0.0`, and npm's
      `latest` is 7.
- [ ] Raise the floors of `svelte` (≥ 5.57.1) and `vite` (≥ 8.0.12).
- [ ] Kit 3 needs Node ≥ 22.17. Neither workflow in `.github/workflows/`
      runs `setup-node`, so CI uses whatever the runner ships. Add it with
      a pinned version.

## Config

- [ ] `svelte.config.js` is no longer read. Move it into `sveltekit({...})`
      in `vite.config.ts`, with the `kit.*` options going top-level
      (adapter, `outDir`, `paths`), plus `compilerOptions.warningFilter`.
      The `AKIKO_E2E` flag already lives in `vite.config.ts`, so the two
      merge. Update the comments that point at `svelte.config.js`, e.g. in
      `eslint.config.js`.
- [ ] The template drops `preprocess: vitePreprocess()`. Check whether the
      SCSS in components still needs it.
- [ ] `tsconfig.json` extends `"$app/tsconfig"` and lists `include` and
      `exclude` itself. Remove the options the base already sets. The base
      turns on `verbatimModuleSyntax` and `isolatedModules`, and
      svelte-check found no errors with both enabled on the current code.
- [ ] `version.pollInterval` now defaults to one hour, so the site polls
      `_app/version.json`. Set it to 0 unless we want that.

## Code

- [ ] `$lib` → `#lib`: 224 imports in 80 files. Add the `imports` map to
      `package.json` (`"#lib": "./src/lib/index.js"`,
      `"#lib/*": "./src/lib/*"`), and give each import its file extension
      (`#lib/akiko.ts`).
  - [ ] `src/routes/+layout.svelte` has `@use "$lib/fonts.scss"`. Sass
        doesn't resolve `#lib`, so use a relative path.
  - [ ] `.claude/skills/snapshot-refactor/scripts/snapshot.test.ts`.
- [ ] `$app/environment` → `$app/env` in `ContactEmail.svelte`,
      `+layout.svelte` and `MajorApp.svelte`.
- [ ] `asset()` takes paths without a leading `/`
      (`asset("images/akiko.png")`), about 20 calls, including
      `major-config.ts`. `resolve()` calls stay as they are, since they
      take route IDs.

## Optional, from the template

- [ ] `prettier-plugin-svelte` 4, and `prettier` as a direct
      devDependency (only the plugin is listed now).
- [ ] `compilerOptions.runes` to force runes mode outside `node_modules`.
- [ ] `engine-strict=true` in `.npmrc`.

## Finish

- [ ] `npm run verify` passes.
- [ ] Update `CLAUDE.md` where it mentions anything changed above.
