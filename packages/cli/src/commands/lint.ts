/**
 * Lint command - lints Teloce project
 */

import chalk from 'chalk';
import ora from 'ora';
import { logger } from '../logger';
import { glob } from 'fs';
import * as fs from 'fs-extra';
import { promisify } from 'util';

const globAsync = promisify(glob);

export interface LintOptions {
  fix?: boolean;
  strict?: boolean;
}

export async function lintCommand(options: LintOptions, command: any): Promise<void> {
  const spinner = ora('Linting Teloce project...').start();

  try {
    // Find .teloce files
    const files = await globAsync('**/*.teloce', { ignore: ['node_modules/**', 'dist/**'] });
    const jsFiles = await globAsync('**/*.{js,ts}', { ignore: ['node_modules/**', 'dist/**'] });

    const allFiles = [...files, ...jsFiles];
    const lintErrors: string[] = [];
    const lintWarnings: string[] = [];
    let fixed = 0;

    spinner.text = `Linting ${allFiles.length} files...`;

    for (const file of allFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const result = lintFile(file, content, options);

      lintErrors.push(...result.errors);
      lintWarnings.push(...result.warnings);

      if (options.fix && result.fixed) {
        fixed++;
        await fs.writeFile(file, result.fixedContent || content);
      }
    }

    spinner.stop();

    // Display results
    console.log(chalk.cyan('\n📋 Lint Report\n'));

    if (lintErrors.length === 0 && lintWarnings.length === 0) {
      console.log(chalk.green('✅ No linting issues found!'));
    } else {
      if (lintErrors.length > 0) {
        console.log(chalk.red(`❌ ${lintErrors.length} errors:`));
        for (const error of lintErrors) {
          console.log(chalk.red(`   ${error}`));
        }
      }
      if (lintWarnings.length > 0) {
        console.log(chalk.yellow(`⚠️  ${lintWarnings.length} warnings:`));
        for (const warning of lintWarnings) {
          console.log(chalk.yellow(`   ${warning}`));
        }
      }
      if (options.fix && fixed > 0) {
        console.log(chalk.green(`\n✅ ${fixed} files fixed`));
      }
    }

    if (lintErrors.length > 0) {
      process.exit(1);
    }

  } catch (error) {
    spinner.fail('Linting failed');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Lint a single file
 */
function lintFile(
  file: string,
  content: string,
  options: LintOptions
): {
  errors: string[];
  warnings: string[];
  fixed?: boolean;
  fixedContent?: string;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let fixedContent = content;
  let fixed = false;

  // Check for missing semicolons
  if (options.strict) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        warnings.push(`${file}:${i + 1} - Missing semicolon`);
        if (options.fix) {
          lines[i] = line + ';';
          fixed = true;
        }
      }
    }
    if (fixed) {
      fixedContent = lines.join('\n');
    }
  }

  // Check for unused variables (basic)
  const varRegex = /(?:let|const|var)\s+(\w+)/g;
  const usedVars = new Set<string>();
  const definedVars = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = varRegex.exec(content)) !== null) {
    definedVars.add(match[1]);
  }

  // Simple usage check
  for (const varName of definedVars) {
    if (content.includes(varName + '(') || content.includes(varName + ' ')) {
      usedVars.add(varName);
    }
  }

  for (const varName of definedVars) {
    if (!usedVars.has(varName)) {
      warnings.push(`${file} - Unused variable: ${varName}`);
    }
  }

  return {
    errors,
    warnings,
    fixed,
    fixedContent,
  };
}