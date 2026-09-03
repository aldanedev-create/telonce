import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  platform: 'node',
  target: 'node18',
  clean: true,
  sourcemap: true,
  minify: false,
  external: ['vscode'],
  // Bundle every @teloce/* workspace dependency (language-service, and
  // whatever it transitively pulls in - compiler, shared) directly into
  // dist/extension.cjs, rather than leaving them as unresolved `require()`
  // calls pointing at node_modules.
  //
  // Without this, tsup/esbuild's default behavior treats every
  // non-relative import as external (confirmed: dist/extension.cjs
  // previously contained a raw, unbundled `require("@teloce/language-
  // service")`), which only works as long as node_modules/@teloce/
  // language-service physically exists next to the extension at runtime.
  // That's true inside this monorepo's own dev/debug setup (pnpm's
  // workspace symlinks), but this extension's own `package`/`publish`
  // scripts run `vsce package --no-dependencies` - which explicitly
  // excludes node_modules from the shipped .vsix entirely. Since the
  // import sits at the very top of extension.ts, evaluated before
  // activate() ever runs, a real installed copy would throw "Cannot
  // find module '@teloce/language-service'" immediately and the whole
  // extension would fail to activate - not just the features that use
  // it. The declarative bits (syntax highlighting, language/file-icon
  // association via `contributes` in package.json) don't need any JS
  // to run at all, so those still appear to work, while every
  // JS-powered feature (autocomplete, hover, diagnostics, formatting,
  // symbols, commands) is silently missing - which is exactly what
  // "I don't see most of its features" looks like from the outside.
  //
  // `vscode` stays external correctly, unaffected by this - it isn't a
  // real npm package to bundle at all, it's a virtual module the
  // extension host provides at runtime.
  noExternal: [/@teloce\/.*/],
  outDir: 'dist',
  splitting: false,
  dts: false,
});