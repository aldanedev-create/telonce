/**
 * Framework detection - auto-detects Python frameworks using precise import parsing and dependency inspection
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
 * Strip Python comments and docstrings from code to ensure true import awareness
 */
function cleanPythonCode(code: string): string {
  // Remove multi-line triple-quote strings/docstrings and block comments
  let cleaned = code.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|\/\*[\s\S]*?\*\/)/g, '');
  // Remove single-line comments (#)
  cleaned = cleaned.replace(/#.*$/gm, '');
  return cleaned;
}

/**
 * Check if cleaned Python code contains a genuine import of the framework
 */
function hasTruePythonImport(content: string, framework: string): boolean {
  const cleaned = cleanPythonCode(content);
  // Matches "import framework" or "from framework import" or "from framework.something import"
  const importRegex = new RegExp(`\\b(?:import\\s+${framework}\\b|from\\s+${framework}\\b|from\\s+${framework}\\.)`, 'i');
  return importRegex.test(cleaned);
}

/**
 * Recursively find all .py files in directory (ignoring virtualenvs, git, cache)
 */
async function findPythonFiles(dir: string, fileList: string[] = []): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (['node_modules', '.git', 'venv', '.venv', '__pycache__', 'dist', 'build'].includes(entry.name)) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await findPythonFiles(fullPath, fileList);
      } else if (entry.isFile() && entry.name.endsWith('.py')) {
        fileList.push(fullPath);
      }
    }
  } catch {
    // Ignore read errors
  }
  return fileList;
}

/**
 * Detect the Python framework in the current directory with true import and dependency awareness
 */
export async function detectFramework(): Promise<Framework | null> {
  const cwd = process.cwd();

  // 1. Check dependency config files first (requirements.txt, pyproject.toml)
  const reqPath = path.join(cwd, 'requirements.txt');
  if (await fs.pathExists(reqPath)) {
    const reqContent = await fs.readFile(reqPath, 'utf-8');
    const lowerReq = reqContent.toLowerCase();
    if (lowerReq.includes('django')) return 'django';
    if (lowerReq.includes('fastapi')) return 'fastapi';
    if (lowerReq.includes('quart')) return 'quart';
    if (lowerReq.includes('flaxon')) return 'flaxon';
    if (lowerReq.includes('flask')) return 'flask';
  }

  const pyprojectPath = path.join(cwd, 'pyproject.toml');
  if (await fs.pathExists(pyprojectPath)) {
    const pyprojectContent = await fs.readFile(pyprojectPath, 'utf-8');
    const lowerP = pyprojectContent.toLowerCase();
    if (lowerP.includes('django')) return 'django';
    if (lowerP.includes('fastapi')) return 'fastapi';
    if (lowerP.includes('quart')) return 'quart';
    if (lowerP.includes('flaxon')) return 'flaxon';
    if (lowerP.includes('flask')) return 'flask';
  }

  // 2. Scan all Python source files for true imports with priority ordering
  const pyFiles = await findPythonFiles(cwd);

  for (const filePath of pyFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      if (hasTruePythonImport(content, 'django')) return 'django';
    } catch {}
  }

  for (const filePath of pyFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      if (hasTruePythonImport(content, 'fastapi')) return 'fastapi';
    } catch {}
  }

  for (const filePath of pyFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      if (hasTruePythonImport(content, 'quart')) return 'quart';
      if (hasTruePythonImport(content, 'flaxon')) return 'flaxon';
      if (hasTruePythonImport(content, 'flask')) return 'flask';
    } catch {}
  }

  // 3. Fallback signature file checks (manage.py, main.py, app.py)
  const managePath = path.join(cwd, 'manage.py');
  if (await fs.pathExists(managePath)) {
    const content = await fs.readFile(managePath, 'utf-8');
    if (hasTruePythonImport(content, 'django')) return 'django';
  }

  const mainPath = path.join(cwd, 'main.py');
  if (await fs.pathExists(mainPath)) {
    const content = await fs.readFile(mainPath, 'utf-8');
    if (hasTruePythonImport(content, 'fastapi')) return 'fastapi';
  }

  const appPath = path.join(cwd, 'app.py');
  if (await fs.pathExists(appPath)) {
    const content = await fs.readFile(appPath, 'utf-8');
    if (hasTruePythonImport(content, 'quart')) return 'quart';
    if (hasTruePythonImport(content, 'flaxon')) return 'flaxon';
    if (hasTruePythonImport(content, 'flask')) return 'flask';
  }

  // 4. Fallback unknown if template folder or python files exist
  if (await fs.pathExists(path.join(cwd, 'templates')) || pyFiles.length > 0) {
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

export async function detectFrameworkInfo(): Promise<FrameworkInfo | null> {
  const framework = await detectFramework();
  if (!framework) return null;
  return getFrameworkInfo(framework);
}