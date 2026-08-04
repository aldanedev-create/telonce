/**
 * Debug command - opens debugger dashboard
 */

import chalk from 'chalk';
import ora from 'ora';
import { serveDashboard } from '@teloce/debugger';
import { loadConfig } from '../config';
import { logger } from '../logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DebugOptions {
  port?: string;
  host?: string;
  open?: boolean;
}

export async function debugCommand(options: DebugOptions, command: any): Promise<void> {
  const spinner = ora('Starting Teloce debugger...').start();

  try {
    // Load configuration
    const config = await loadConfig();
    const port = parseInt(options.port || config.debugger?.port || '9000');
    const host = options.host || config.debugger?.host || 'localhost';
    const openBrowser = options.open !== false;

    // Start debugger server
    const server = serveDashboard({
      port,
      host,
      open: openBrowser,
      config,
    });

    spinner.succeed(`Debugger started at http://${host}:${port}`);

    console.log(chalk.green('\n🐛 Teloce Debugger'));
    console.log(chalk.blue(`   URL: http://${host}:${port}`));
    console.log(chalk.gray('   Dashboard provides:'));
    console.log(chalk.gray('   - Application status'));
    console.log(chalk.gray('   - Component tree'));
    console.log(chalk.gray('   - State inspector'));
    console.log(chalk.gray('   - Performance metrics'));
    console.log(chalk.gray('   - Error translations'));

    // Open browser
    if (openBrowser) {
      try {
        const url = `http://${host}:${port}`;
        if (process.platform === 'darwin') {
          await execAsync(`open ${url}`);
        } else if (process.platform === 'win32') {
          await execAsync(`start ${url}`);
        } else {
          await execAsync(`xdg-open ${url}`);
        }
        console.log(chalk.gray(`\n   Browser opened to ${url}`));
      } catch {
        console.log(chalk.yellow(`\n   Open your browser to http://${host}:${port}`));
      }
    }

    console.log(chalk.gray('\n   Press Ctrl+C to stop\n'));

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\nShutting down debugger...'));
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await server.close();
      process.exit(0);
    });

  } catch (error) {
    spinner.fail('Failed to start debugger');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}