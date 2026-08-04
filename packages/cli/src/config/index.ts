/**
 * Configuration - loads and manages Teloce configuration
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export interface TeloceConfig {
  /**
   * Framework settings
   */
  framework?: {
    autoDetect?: boolean;
    flask?: {
      staticFolder?: string;
      templatesFolder?: string;
    };
    django?: {
      staticFolder?: string;
      templatesFolder?: string;
    };
    fastapi?: {
      staticFolder?: string;
      templatesFolder?: string;
    };
  };

  /**
   * Compiler settings
   */
  compiler?: {
    sourceMaps?: boolean;
    minify?: boolean;
    target?: 'es2020' | 'es2019' | 'es2018' | 'es2017';
    strictMode?: boolean;
  };

  /**
   * Development server settings
   */
  devServer?: {
    port?: number;
    host?: string;
    open?: boolean;
    hotReload?: boolean;
    proxy?: string;
    staticFolder?: string;
  };

  /**
   * Debugger settings
   */
  debugger?: {
    port?: number;
    host?: string;
    open?: boolean;
  };

  /**
   * Build settings
   */
  build?: {
    outDir?: string;
    chunkSize?: number;
    treeShaking?: boolean;
    bundleAnalyzer?: boolean;
    minify?: boolean;
    sourceMap?: boolean;
    chunkSplitting?: boolean;
  };

  /**
   * CDN settings
   */
  cdn?: {
    url?: string;
    version?: string;
  };
}

const defaultConfig: TeloceConfig = {
  framework: {
    autoDetect: true,
  },
  compiler: {
    sourceMaps: true,
    minify: true,
    target: 'es2020',
    strictMode: true,
  },
  devServer: {
    port: 5173,
    host: 'localhost',
    open: true,
    hotReload: true,
    staticFolder: 'static',
  },
  debugger: {
    port: 9000,
    host: 'localhost',
    open: true,
  },
  build: {
    outDir: 'dist',
    chunkSize: 500,
    treeShaking: true,
    bundleAnalyzer: false,
    minify: true,
    sourceMap: false,
    chunkSplitting: true,
  },
  cdn: {
    url: 'https://cdn.teloce.dev',
    version: 'latest',
  },
};

/**
 * Load configuration from file
 */
export async function loadConfig(): Promise<TeloceConfig> {
  const configPaths = [
    'teloce.config.js',
    'teloce.config.ts',
    'teloce.config.json',
    '.telocerc',
  ];

  for (const configPath of configPaths) {
    const fullPath = path.join(process.cwd(), configPath);
    if (await fs.pathExists(fullPath)) {
      try {
        if (configPath.endsWith('.json') || configPath === '.telocerc') {
          const content = await fs.readFile(fullPath, 'utf-8');
          const config = JSON.parse(content);
          return mergeConfig(defaultConfig, config);
        } else {
          // For JS/TS files, we'd need to import dynamically
          // This is a simplified version
          console.log(`Config file found: ${configPath}`);
        }
      } catch (error) {
        console.warn(`Failed to load config from ${configPath}`);
      }
    }
  }

  return defaultConfig;
}

/**
 * Merge configurations
 */
function mergeConfig(
  base: TeloceConfig,
  override: Partial<TeloceConfig>
): TeloceConfig {
  return {
    ...base,
    ...override,
    framework: { ...base.framework, ...override.framework },
    compiler: { ...base.compiler, ...override.compiler },
    devServer: { ...base.devServer, ...override.devServer },
    debugger: { ...base.debugger, ...override.debugger },
    build: { ...base.build, ...override.build },
    cdn: { ...base.cdn, ...override.cdn },
  };
}

/**
 * Save configuration to file
 */
export async function saveConfig(
  config: TeloceConfig,
  path: string = 'teloce.config.json'
): Promise<void> {
  await fs.writeFile(path, JSON.stringify(config, null, 2));
}