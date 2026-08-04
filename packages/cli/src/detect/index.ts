/**
 * Framework detection - auto-detects Python frameworks
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
 * Detect the Python framework in the current directory
 */
export async function detectFramework(): Promise<Framework | null> {
  const cwd = process.cwd();

  // Check for Flask
  if (await fs.pathExists(path.join(cwd, 'app.py'))) {
    const content = await fs.readFile(path.join(cwd, 'app.py'), 'utf-8');
    if (content.includes('flask') || content.includes('Flask')) {
      return 'flask';
    }
  }

  // Check for Django
  if (await fs.pathExists(path.join(cwd, 'manage.py'))) {
    const content = await fs.readFile(path.join(cwd, 'manage.py'), 'utf-8');
    if (content.includes('django')) {
      return 'django';
    }
  }

  // Check for FastAPI
  if (await fs.pathExists(path.join(cwd, 'main.py'))) {
    const content = await fs.readFile(path.join(cwd, 'main.py'), 'utf-8');
    if (content.includes('fastapi') || content.includes('FastAPI')) {
      return 'fastapi';
    }
  }

  // Check for Quart
  if (await fs.pathExists(path.join(cwd, 'app.py'))) {
    const content = await fs.readFile(path.join(cwd, 'app.py'), 'utf-8');
    if (content.includes('quart') || content.includes('Quart')) {
      return 'quart';
    }
  }

  // Check for Flaxon
  if (await fs.pathExists(path.join(cwd, 'app.py'))) {
    const content = await fs.readFile(path.join(cwd, 'app.py'), 'utf-8');
    if (content.includes('flaxon') || content.includes('Flaxon')) {
      return 'flaxon';
    }
  }

  // Check for templates folder (could be any framework)
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