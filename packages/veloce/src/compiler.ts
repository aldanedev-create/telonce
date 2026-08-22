// Optional entry for Node-side/build-tooling code that explicitly wants
// programmatic access to the .vel compiler - e.g. a custom build script,
// codemod, or tool that isn't @teloce/vite-plugin itself. Import this via
// the `teloce/compiler` subpath rather than the main `teloce` entry, so
// browser bundles that only need `import { createApp } from 'teloce'`
// never pull this in (see the comment at the top of src/index.ts).
export { compile } from '@teloce/compiler';
export { compileSFC, parse } from '@teloce/sfc';
