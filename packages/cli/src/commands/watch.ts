/**
 * Watch command - watches for changes and rebuilds with real SFC compilation
 */

import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../config';
import { logger } from '../logger';
import { compile } from '@teloce/compiler';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface WatchOptions {
  outDir?: string;
  hmr?: boolean;
}

/**
 * Recursively find all .vel files while ignoring node_modules and dist
 */
async function getVelFiles(dir: string): Promise<string[]> {
  let results: string[] = [];
  if (!(await fs.pathExists(dir))) return results;
  
  const list = await fs.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        results = results.concat(await getVelFiles(filePath));
      }
    } else if (filePath.endsWith('.vel')) {
      results.push(filePath);
    }
  }
  return results;
}

export async function watchCommand(options: WatchOptions, _command: any): Promise<void> {
  const spinner = ora('Starting watch mode...').start();

  try {
    // Load configuration
    const config = await loadConfig();
    const outDir = options.outDir || config.build?.outDir || 'dist';
    const hmr = options.hmr !== false && config.devServer?.hotReload !== false;

    // Ensure output directory exists
    await fs.ensureDir(outDir);

    spinner.succeed('Watch mode started');

    console.log(chalk.blue(`\n👀 Watching for changes...`));
    console.log(chalk.gray(`   Output directory: ${outDir}`));
    if (hmr) {
      console.log(chalk.gray(`   HMR: Enabled`));
    }

    let isBuilding = false;
    let buildQueue = false;

    // Real rebuild logic compiling .vel files
    async function rebuild() {
      if (isBuilding) {
        buildQueue = true;
        return;
      }

      isBuilding = true;
      const buildSpinner = ora('Rebuilding SFCs...').start();

      try {
        const files = await getVelFiles('src');
        
        for (const file of files) {
          const source = await fs.readFile(file, 'utf-8');
          const result = compile(source, {
            filename: file,
            scoped: (config.build as any)?.scoped ?? true,
            dev: true,
          } as any) as any;

          // Determine output paths
          const relativePath = file.replace(/^src[/\\]/, '');
          const jsOutPath = path.join(outDir, relativePath.replace(/\.vel$/, '.js'));
          
          await fs.ensureDir(path.dirname(jsOutPath));
          await fs.outputFile(jsOutPath, result.code);

          if (result.css) {
            const cssOutPath = path.join(outDir, relativePath.replace(/\.vel$/, '.css'));
            await fs.outputFile(cssOutPath, result.css);
          }
        }

        buildSpinner.succeed(`Rebuilt successfully (${files.length} component${files.length === 1 ? '' : 's'})`);

        // Notify HMR
        if (hmr) {
          console.log(chalk.green(`   🔄 Hot reload triggered`));
        }

      } catch (error) {
        buildSpinner.fail('Rebuild failed');
        logger.error(error instanceof Error ? error.message : String(error));
      }

      isBuilding = false;

      if (buildQueue) {
        buildQueue = false;
        await rebuild();
      }
    }

    // Initial build
    await rebuild();

    console.log(chalk.gray(`\n   Press Ctrl+C to stop\n`));

    // Watch directories recursively to track newly created files automatically
    const watchers: fs.FSWatcher[] = [];
    const watchDirs = ['src'];

    for (const dir of watchDirs) {
      if (await fs.pathExists(dir)) {
        try {
          const watcher = fs.watch(dir, { recursive: true }, (_eventType, filename) => {
            if (filename && filename.endsWith('.vel')) {
              rebuild();
            }
          });
          watchers.push(watcher);
        } catch (err) {
          logger.warn(`Failed to set up recursive watcher for directory "${dir}": ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow(`\nShutting down watcher...`));
      for (const watcher of watchers) {
        watcher.close();
      }
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      for (const watcher of watchers) {
        watcher.close();
      }
      process.exit(0);
    });

  } catch (error) {
    spinner.fail('Failed to start watch mode');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}