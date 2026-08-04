#!/usr/bin/env node

/**
 * @teloce/cli - Command Line Interface
 * 
 * This is the CLI for Teloce.
 * It provides commands for development, building, debugging, and more.
 */

import { Command } from 'commander';
import { devCommand } from './commands/dev';
import { buildCommand } from './commands/build';
import { debugCommand } from './commands/debug';
import { createCommand } from './commands/create';
import { doctorCommand } from './commands/doctor';
import { lintCommand } from './commands/lint';
import { watchCommand } from './commands/watch';

const program = new Command();

program
  .name('teloce')
  .description('Teloce CLI - A TypeScript template engine for Python web developers')
  .version('0.1.0');

// Register commands
program
  .command('dev')
  .description('Start development server with hot reload')
  .option('-p, --port <port>', 'Port to run on', '5173')
  .option('-h, --host <host>', 'Host to bind to', 'localhost')
  .option('--no-hmr', 'Disable hot module replacement')
  .option('--proxy <target>', 'Proxy target URL')
  .action(devCommand);

program
  .command('build')
  .description('Build for production')
  .option('-o, --out-dir <dir>', 'Output directory', 'dist')
  .option('--minify', 'Minify output', true)
  .option('--no-minify', 'Disable minification')
  .option('--source-map', 'Generate source maps')
  .option('--chunks', 'Enable chunk splitting')
  .action(buildCommand);

program
  .command('debug')
  .description('Open debugger dashboard')
  .option('-p, --port <port>', 'Port for debugger', '9000')
  .option('-h, --host <host>', 'Host for debugger', 'localhost')
  .option('--no-open', "Don't open browser automatically")
  .action(debugCommand);

program
  .command('create')
  .description('Create a new Teloce project')
  .argument('[name]', 'Project name')
  .option('-t, --template <template>', 'Template to use', 'flask')
  .option('--no-install', "Skip dependency installation")
  .option('--no-git', "Skip git initialization")
  .action(createCommand);

program
  .command('doctor')
  .description('Check environment and configuration')
  .option('-v, --verbose', 'Show verbose output')
  .action(doctorCommand);

program
  .command('lint')
  .description('Lint your Teloce project')
  .option('-f, --fix', 'Fix linting issues')
  .option('--strict', 'Strict linting mode')
  .action(lintCommand);

program
  .command('watch')
  .description('Watch for changes and rebuild')
  .option('-o, --out-dir <dir>', 'Output directory', 'dist')
  .option('--no-hmr', 'Disable hot module replacement')
  .action(watchCommand);

// Default command - show help
if (process.argv.length === 2) {
  program.outputHelp();
}

export { program };