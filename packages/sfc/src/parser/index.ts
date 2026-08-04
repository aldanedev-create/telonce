/**
 * SFC Parser - splits .vel file into template/script/style sections
 */

export interface SFCResult {
  /**
   * Component name (from script export)
   */
  name?: string;

  /**
   * Template section content
   */
  template: string;

  /**
   * Script section content
   */
  script: string;

  /**
   * Style section content
   */
  style?: string;

  /**
   * Style language (css, scss, less)
   */
  styleLang?: string;

  /**
   * Script language (js, ts)
   */
  scriptLang?: string;

  /**
   * Diagnostics
   */
  diagnostics: {
    errors: string[];
    warnings: string[];
  };
}

export interface SFCParserOptions {
  /**
   * Filename for error reporting
   */
  filename?: string;
}

/**
 * Parse a .vel Single File Component
 */
export function parseSFC(
  source: string,
  options: SFCParserOptions = {}
): SFCResult {
  const diagnostics = {
    errors: [] as string[],
    warnings: [] as string[],
  };

  let template = '';
  let script = '';
  let style: string | undefined;
  let styleLang: string | undefined;
  let scriptLang: string | undefined;
  let name: string | undefined;

  // Find sections using regex
  const templateMatch = source.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  if (templateMatch) {
    template = templateMatch[1].trim();
  } else {
    diagnostics.errors.push('Missing <template> section');
  }

  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    script = scriptMatch[1].trim();
    // Extract lang attribute
    const langMatch = scriptMatch[0].match(/lang=["']([^"']+)["']/);
    if (langMatch) {
      scriptLang = langMatch[1];
    }
    // Extract component name
    const nameMatch = script.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      name = nameMatch[1];
    }
    // Extract export default
    const exportMatch = script.match(/export\s+default\s+({[\s\S]*})/);
    if (exportMatch) {
      // Parse the object to extract name
      const objStr = exportMatch[1];
      const nameInObj = objStr.match(/name:\s*['"]([^'"]+)['"]/);
      if (nameInObj && !name) {
        name = nameInObj[1];
      }
    }
  } else {
    diagnostics.warnings.push('No <script> section found');
  }

  const styleMatch = source.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    style = styleMatch[1].trim();
    // Extract lang attribute
    const langMatch = styleMatch[0].match(/lang=["']([^"']+)["']/);
    if (langMatch) {
      styleLang = langMatch[1];
    }
  }

  return {
    name,
    template,
    script,
    style,
    styleLang,
    scriptLang,
    diagnostics,
  };
}