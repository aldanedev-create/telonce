# @teloce/bundler

Production bundler for Teloce - tree-shaking, minification, and chunk splitting.

## Installation

```bash
npm install @teloce/bundler
What It Does
The bundler optimizes your Teloce application for production by:

Tree-shaking: Removes unused code from your bundle

Minification: Compresses JavaScript, CSS, and HTML

Chunk splitting: Splits your code into optimal chunks for faster loading

Usage
Basic Bundle
javascript
import { bundle } from '@teloce/bundler';

const result = bundle({
  entry: 'src/main.js',
  outDir: 'dist',
  minify: true,
  sourceMap: true
});

console.log('Bundled files:', result.files);
console.log('Stats:', result.stats);
With Tree-shaking
javascript
import { treeShake, analyzeImports, analyzeExports } from '@teloce/bundler';

// Analyze imports in a module
const imports = analyzeImports(code, 'module.js');

// Analyze exports in a module
const exports = analyzeExports(code, 'module.js');

// Remove unused code
const optimized = removeUnused(code, new Set(['usedFunction']));
With Minification
javascript
import { minify, minifyJavaScript, minifyCSS, minifyHTML } from '@teloce/bundler';

// Minify JavaScript
const result = minifyJavaScript(code, {
  removeComments: true,
  collapseWhitespace: true,
  shortenNames: true
});

console.log('Reduction:', result.reduction + '%');

// Minify CSS
const cssResult = minifyCSS(cssCode);

// Minify HTML
const htmlResult = minifyHTML(htmlCode);
With Chunk Splitting
javascript
import { createChunks, splitChunks, optimizeChunks } from '@teloce/bundler';

// Create chunks from entry files
const result = createChunks(['src/app.js', 'src/admin.js'], {
  splitVendor: true,
  targetSize: 50000
});

// Optimize chunks
const optimized = optimizeChunks(result.chunks, {
  minSize: 10000
});
API Reference
bundle(options)
Bundle a Teloce application.

Options:

entry - Entry file(s)

outDir - Output directory

treeShake - Enable tree-shaking

minify - Enable minification

chunks - Enable chunk splitting

sourceMap - Generate source maps

dev - Development mode

treeShake(entries, options)
Perform tree-shaking on modules.

minify(code, options)
Minify code with auto-detection.

minifyJavaScript(code, options)
Minify JavaScript code.

minifyCSS(code, options)
Minify CSS code.

minifyHTML(code, options)
Minify HTML code.

createChunks(entries, options)
Create chunks from entry files.

splitChunks(modules, options)
Split code into chunks.

optimizeChunks(chunks, options)
Optimize chunk configuration.

License
MIT