/**
 * Framework detection - auto-detects Python frameworks using precise import parsing
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export type Framework = 'flask' | 'django' | 'fastapi' | 'quart' | 'flaxon' | 'unknown';

export interface FrameworkInfo {
  name: Framework;
  displayName: string;
  staticFolder: string;
  templatesFolder: string;
  port: number;
  description: string;
}

/**
 * Helper to check for valid Python import statements (import framework / from framework import)
 */
function hasPythonImport(content: string, framework: string): boolean {
  const regex = new RegExp(`(?:^|\\n)\\s*(?:import\\s+${framework}\\b|from\\s+${framework}\\b)`, 'i');
  return regex.test(content);
}

/**
 * Detect the Python framework in the current directory with correct execution priority
 */
export async function detectFramework(): Promise<Framework | null> {
  const cwd = process.cwd();

  // 1. Check for Django (manage.py)
  const managePath = path.join(cwd, 'manage.py');
  if (await fs.pathExists(managePath)) {
    const content = await fs.readFile(managePath, 'utf-8');
    if (hasPythonImport(content, 'django')) {
      return 'django';
    }
  }

  // 2. Check for FastAPI (main.py)
  const mainPath = path.join(cwd, 'main.py');
  if (await fs.pathExists(mainPath)) {
    const content = await fs.readFile(mainPath, 'utf-8');
    if (hasPythonImport(content, 'fastapi')) {
      return 'fastapi';
    }
  }

  // 3. Check for app.py-based frameworks (Quart, Flaxon, Flask) in correct specificity order
  const appPath = path.join(cwd, 'app.py');
  if (await fs.pathExists(appPath)) {
    const content = await fs.readFile(appPath, 'utf-8');

    // Check specialized / async frameworks before generic Flask to fix early-return shadowing
    if (hasPythonImport(content, 'quart')) {
      return 'quart';
    }
    if (hasPythonImport(content, 'flaxon')) {
      return 'flaxon';
    }
    if (hasPythonImport(content, 'flask')) {
      return 'flask';
    }
  }

  // 4. Check for templates folder (fallback unknown framework)
  if (await fs.pathExists(path.join(cwd, 'templates'))) {
    return 'unknown';
  }

  return null;
}

/**
 * Get framework information
 */
export function getFrameworkInfo(framework: Framework): FrameworkInfo {
  const infos: Record<Framework, FrameworkInfo> = {
    flask: {
      name: 'flask',
      displayName: 'Flask',
      staticFolder: 'static',
      templatesFolder: 'templates',
      port: 5000,
      description: 'Lightweight Python web framework',
    },
    django: {
      name: 'django',
      displayName: 'Django',
      staticFolder: 'static',
      templatesFolder: 'templates',
      port: 8000,
      description: 'High-level Python web framework',
    },
    fastapi: {
      name: 'fastapi',
      displayName: 'FastAPI',
      staticFolder: 'static',
      templatesFolder: 'templates',
      port: 8000,
      description: 'Modern Python web framework for APIs',
    },
    quart: {
      name: 'quart',
      displayName: 'Quart',
      staticFolder: 'static',
      templatesFolder: 'templates',
      port: 5000,
      description: 'Async Python web framework',
    },
    flaxon: {
      name: 'flaxon',
      displayName: 'Flaxon',
      staticFolder: 'static',
      templatesFolder: 'templates',
      port: 8000,
      description: 'Simple Python web framework',
    },
    unknown: {
      name: 'unknown',
      displayName: 'Unknown',
      staticFolder: 'static',
      templatesFolder: 'templates',
      port: 5173,
      description: 'Unknown Python framework',
    },
  };

  return infos[framework] || infos.unknown;
}

/**
 * Detect and get framework info
 */
export async function detectFrameworkInfo(): Promise<FrameworkInfo | null> {
  const framework = await detectFramework();
  if (!framework) return null;
  return getFrameworkInfo(framework);
}