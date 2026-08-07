/**
 * @teloce/sfc - Single File Component Compiler
 * 
 * This package compiles .vel Single File Components.
 * It splits the file into <template>, <script>, and <style> sections
 * and hands off each section to the appropriate compiler.
 */

import { parseSFC } from './parser';
import { compileScript } from './script';
import { compileStyle } from './style';
import { compileTemplate } from './template';
import { compile } from './compile';

// Export parser (with 'parse' alias for compatibility)
export { parseSFC, parseSFC as parse, type SFCResult, type SFCParserOptions } from './parser';

// Export script compiler
export { compileScript, type ScriptCompileResult, type ScriptCompileOptions } from './script';

// Export style compiler
export { compileStyle, type StyleCompileResult, type StyleCompileOptions, type CSSScope } from './style';

// Export template compiler
export { compileTemplate, type TemplateCompileResult, type TemplateCompileOptions } from './template';

// Export main compile function (with 'compileSFC' alias for compatibility)
export { compile, compile as compileSFC, type SFCCompileOptions, type SFCCompileResult } from './compile';

// Default export
export default {
  parseSFC,
  parse: parseSFC,
  compileScript,
  compileStyle,
  compileTemplate,
  compile,
  compileSFC: compile,
};