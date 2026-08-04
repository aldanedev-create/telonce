/**
 * Dev command - starts development server with hot reload
 */

import chalk from 'chalk';
import ora from 'ora';
import { createDevServer } from '@teloce/server';
import { detectFramework, type Framework } from '../detect';
import { loadConfig, type TeloceConfig } from '../config';
import { logger } from '../logger';

export interface DevOptions {
  port?: string;
  host?: string;
  hmr?: boolean;
  proxy?: string;
}

export async function devCommand(options: DevOptions, command: any): Promise<void> {
  const spinner = ora('Starting Teloce dev server...').start();

  try {
    // Load configuration
    const config = await loadConfig();
    const port = parseInt(options.port || config.devServer?.port || '5173');
    const host = options.host || config.devServer?.host || 'localhost';
    const hmr = options.hmr !== false && config.devServer?.hotReload !== false;
    const proxyTarget = options.proxy || config.devServer?.proxy;

    // Detect framework
    const framework = await detectFramework();
    if (framework) {
      spinner.text = `Detected ${framework} project`;
      spinner.succeed();
    } else {
      spinner.text = 'No Python framework detected. Running standalone.';
      spinner.warn();
    }

    // Create dev server
    const server = createDevServer({
      port,
      host,
      staticDir: config.devServer?.staticFolder || 'static',
      proxyTarget: proxyTarget || getProxyTarget(framework),
      hmr,
      logging: true,
      cors: true,
    });

    // Start server
    await server.start();

    // Show success message
    console.log(chalk.green('\n✅ Dev server started successfully!'));
    console.log(chalk.blue(`\n   Local:   http://${host}:${port}`));
    
    if (framework) {
      console.log(chalk.blue(`   Framework: ${framework}`));
    }
    if (hmr) {
      console.log(chalk.blue(`   HMR:     Enabled`));
    }
    if (proxyTarget) {
      console.log(chalk.blue(`   Proxy:   ${proxyTarget}`));
    }

    console.log(chalk.gray('\n   Press Ctrl+C to stop\n'));

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n\nShutting down...'));
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await server.stop();
      process.exit(0);
    });

  } catch (error) {
    spinner.fail('Failed to start dev server');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Get proxy target based on detected framework
 */
function getProxyTarget(framework?: Framework): string | undefined {
  switch (framework) {
    case 'flask':
      return 'http://localhost:5000';
    case 'django':
      return 'http://localhost:8000';
    case 'fastapi':
      return 'http://localhost:8000';
    case 'quart':
      return 'http://localhost:5000';
    case 'flaxon':
      return 'http://localhost:8080';
    default:
      return undefined;
  }
}