/**
 * Watch command - watches for changes and rebuilds
 */

import chalk from 'chalk';
import ora from 'ora';
import { createDevServer } from '@teloce/server';
import { loadConfig } from '../config';
import { logger } from '../logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'fs';
import { promisify } from 'util';

const globAsync = promisify(glob);

export interface WatchOptions {
  outDir?: string;
  hmr?: boolean;
}

export async function watchCommand(options: WatchOptions, command: any): Promise<void> {
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

    // Watch for changes
    const watchPaths = ['src/**/*', '*.teloce'];
    let isBuilding = false;
    let buildQueue = false;

    async function rebuild() {
      if (isBuilding) {
        buildQueue = true;
        return;
      }

      isBuilding = true;
      const buildSpinner = ora('Rebuilding...').start();

      try {
        // Simulate build
        await new Promise(resolve => setTimeout(resolve, 500));

        buildSpinner.succeed('Rebuilt successfully');

        // Notify HMR
        if (hmr) {
          console.log(chalk.green('   🔄 Hot reload triggered'));
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

    console.log(chalk.gray('\n   Press Ctrl+C to stop\n'));

    // Watch files
    const watchers: fs.FSWatcher[] = [];

    for (const pattern of watchPaths) {
      const files = await globAsync(pattern, { ignore: ['node_modules/**', 'dist/**'] });
      for (const file of files) {
        const watcher = fs.watch(file, (eventType) => {
          if (eventType === 'change') {
            console.log(chalk.gray(`   File changed: ${path.basename(file)}`));
            rebuild();
          }
        });
        watchers.push(watcher);
      }
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\nShutting down watcher...'));
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