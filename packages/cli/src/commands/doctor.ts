/**
 * Doctor command - checks environment and configuration
 */

import chalk from 'chalk';
import ora from 'ora';
import { detectFramework } from '../detect';
import { loadConfig } from '../config';
import { logger } from '../logger';
import * as fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DoctorOptions {
  verbose?: boolean;
}

export async function doctorCommand(options: DoctorOptions, command: any): Promise<void> {
  const spinner = ora('Running Teloce doctor...').start();

  try {
    const checks: Array<{ name: string; passed: boolean; message: string }> = [];

    // Check Node.js version
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
    checks.push({
      name: 'Node.js Version',
      passed: nodeMajor >= 18,
      message: nodeMajor >= 18 ? `✅ ${nodeVersion}` : `❌ ${nodeVersion} (requires >= 18)`,
    });

    // Check npm/pnpm
    try {
      const { stdout } = await execAsync('npm --version');
      checks.push({
        name: 'npm',
        passed: true,
        message: `✅ ${stdout.trim()}`,
      });
    } catch {
      checks.push({
        name: 'npm',
        passed: false,
        message: '❌ npm not found',
      });
    }

    // Check Teloce version
    try {
      const pkg = await fs.readJSON('package.json');
      const teloceVersion = pkg.dependencies?.teloce || pkg.devDependencies?.teloce || 'not found';
      checks.push({
        name: 'Teloce',
        passed: teloceVersion !== 'not found',
        message: teloceVersion !== 'not found' ? `✅ ${teloceVersion}` : '❌ not installed',
      });
    } catch {
      checks.push({
        name: 'Teloce',
        passed: false,
        message: '❌ package.json not found',
      });
    }

    // Detect framework
    const framework = await detectFramework();
    checks.push({
      name: 'Python Framework',
      passed: !!framework,
      message: framework ? `✅ ${framework} detected` : '❌ no Python framework detected',
    });

    // Check configuration
    try {
      const config = await loadConfig();
      checks.push({
        name: 'Configuration',
        passed: true,
        message: '✅ Valid configuration',
      });
      if (options.verbose) {
        console.log(chalk.gray(`   Dev server port: ${config.devServer?.port || 5173}`));
        console.log(chalk.gray(`   Output directory: ${config.build?.outDir || 'dist'}`));
      }
    } catch {
      checks.push({
        name: 'Configuration',
        passed: false,
        message: '❌ Invalid configuration',
      });
    }

    spinner.stop();

    // Display results
    console.log(chalk.cyan('\n🔍 Teloce Doctor Report\n'));

    const passed = checks.filter(c => c.passed);
    const failed = checks.filter(c => !c.passed);

    for (const check of checks) {
      console.log(`${check.passed ? chalk.green('✓') : chalk.red('✗')} ${check.name}: ${check.message}`);
    }

    console.log(chalk.gray(`\n   ${passed.length} passed, ${failed.length} failed`));

    if (failed.length > 0) {
      console.log(chalk.yellow('\n⚠️  Issues found:'));
      for (const check of failed) {
        console.log(chalk.yellow(`   ${check.name}: ${check.message}`));
      }
      process.exit(1);
    }

    console.log(chalk.green('\n✅ All checks passed! Your environment is ready.'));

  } catch (error) {
    spinner.fail('Doctor check failed');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}