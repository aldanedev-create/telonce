/**
 * Build command - builds for production
 */

import chalk from 'chalk';
import ora from 'ora';
import { bundle } from '@teloce/bundler';
import { loadConfig } from '../config';
import { logger } from '../logger';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface BuildOptions {
  outDir?: string;
  minify?: boolean;
  sourceMap?: boolean;
  chunks?: boolean;
}

/**
 * Build command - builds for production
 */
export async function buildCommand(options: BuildOptions, _command: any): Promise<void> {
  const spinner = ora('Building Teloce project...').start();

  try {
    // Load configuration
    const config = await loadConfig();
    const outDir = options.outDir || config.build?.outDir || 'dist';
    const minify = options.minify !== false && config.build?.minify !== false;
    const sourceMap = options.sourceMap || config.build?.sourceMap || false;
    const chunks = options.chunks !== false && config.build?.chunkSplitting !== false;

    // Ensure output directory exists
    await fs.ensureDir(outDir);

    // Bundle the application
    const result = await bundle({
      entry: ['src/main.js'],
      outDir,
      minify,
      sourceMap,
      chunks,
      format: 'esm',
      target: 'browser',
    });

    // Write files
    for (const file of result.files) {
      const filePath = path.join(outDir, file.path);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content);
    }

    spinner.succeed('Build completed successfully!');

    // Show stats
    console.log(chalk.green('\n📦 Build Statistics:'));
    console.log(chalk.blue(`   Total size: ${formatSize(result.stats.totalSize)}`));
    console.log(chalk.blue(`   Gzip size:  ${formatSize(result.stats.gzipSize)}`));
    console.log(chalk.blue(`   Files:      ${result.stats.fileCount}`));
    console.log(chalk.blue(`   Modules:    ${result.stats.moduleCount}`));
    console.log(chalk.blue(`   Build time: ${result.stats.buildTime}ms`));
    
    if (result.stats.chunkCount) {
      console.log(chalk.blue(`   Chunks:     ${result.stats.chunkCount}`));
    }

    console.log(chalk.gray(`\n   Output directory: ${outDir}`));

    // Show warnings
    if (result.diagnostics.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      for (const warning of result.diagnostics.warnings) {
        console.log(chalk.yellow(`   ${warning}`));
      }
    }

  } catch (error) {
    spinner.fail('Build failed');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Format file size
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}