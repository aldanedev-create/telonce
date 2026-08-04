/**
 * Create command - scaffolds a new project
 */

import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface CreateOptions {
  template?: string;
  install?: boolean;
  git?: boolean;
}

/**
 * Project templates
 */
const TEMPLATES = {
  flask: {
    description: 'Flask + Teloce project',
    files: {
      'app.py': `from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html', name='Teloce')

if __name__ == '__main__':
    app.run(debug=True)
`,
      'templates/index.html': `<!DOCTYPE html>
<html>
<head>
    <title>Teloce + Flask</title>
    <script src="https://cdn.teloce.dev/teloce.min.js"></script>
</head>
<body>
    <div id="app">
        <h1>Hello {{ name }}</h1>
        <button @click="count++">Count: {{ count }}</button>
    </div>
    <script>
        teloce.create('#app', {
            name: '{{ name }}',
            count: 0
        });
    </script>
</body>
</html>`,
      'requirements.txt': `flask>=2.3.0
teloce`,
    },
  },
  django: {
    description: 'Django + Teloce project',
    files: {
      'manage.py': `#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`,
      'project/settings.py': `# Django settings`,
      'project/urls.py': `# Django urls`,
      'templates/index.html': `<!DOCTYPE html>
<html>
<head>
    <title>Teloce + Django</title>
    <script src="https://cdn.teloce.dev/teloce.min.js"></script>
</head>
<body>
    <div id="app">
        <h1>Hello {{ name }}</h1>
        <button @click="count++">Count: {{ count }}</button>
    </div>
    <script>
        teloce.create('#app', {
            name: '{{ name }}',
            count: 0
        });
    </script>
</body>
</html>`,
    },
  },
  fastapi: {
    description: 'FastAPI + Teloce project',
    files: {
      'main.py': `from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "name": "Teloce"}
    )
`,
      'templates/index.html': `<!DOCTYPE html>
<html>
<head>
    <title>Teloce + FastAPI</title>
    <script src="https://cdn.teloce.dev/teloce.min.js"></script>
</head>
<body>
    <div id="app">
        <h1>Hello {{ name }}</h1>
        <button @click="count++">Count: {{ count }}</button>
    </div>
    <script>
        teloce.create('#app', {
            name: '{{ name }}',
            count: 0
        });
    </script>
</body>
</html>`,
      'requirements.txt': `fastapi>=0.100.0
jinja2>=3.1.0
teloce`,
    },
  },
  quart: {
    description: 'Quart + Teloce project',
    files: {
      'app.py': `from quart import Quart, render_template

app = Quart(__name__)

@app.route('/')
async def home():
    return await render_template('index.html', name='Teloce')

if __name__ == '__main__':
    app.run(debug=True)
`,
      'templates/index.html': `<!DOCTYPE html>
<html>
<head>
    <title>Teloce + Quart</title>
    <script src="https://cdn.teloce.dev/teloce.min.js"></script>
</head>
<body>
    <div id="app">
        <h1>Hello {{ name }}</h1>
        <button @click="count++">Count: {{ count }}</button>
    </div>
    <script>
        teloce.create('#app', {
            name: '{{ name }}',
            count: 0
        });
    </script>
</body>
</html>`,
      'requirements.txt': `quart>=0.19.0
teloce`,
    },
  },
  flaxon: {
    description: 'Flaxon + Teloce project',
    files: {
      'app.py': `from flaxon import Flaxon

app = Flaxon(__name__)

@app.route('/')
def home():
    return app.render_template('index.html', name='Teloce')

if __name__ == '__main__':
    app.run()
`,
      'templates/index.html': `<!DOCTYPE html>
<html>
<head>
    <title>Teloce + Flaxon</title>
    <script src="https://cdn.teloce.dev/teloce.min.js"></script>
</head>
<body>
    <div id="app">
        <h1>Hello {{ name }}</h1>
        <button @click="count++">Count: {{ count }}</button>
    </div>
    <script>
        teloce.create('#app', {
            name: '{{ name }}',
            count: 0
        });
    </script>
</body>
</html>`,
      'requirements.txt': `flaxon>=0.1.0
teloce`,
    },
  },
};

export async function createCommand(
  name: string | undefined,
  options: CreateOptions
): Promise<void> {
  const projectName = name || 'my-teloce-app';
  const templateName = options.template || 'flask';
  const installDeps = options.install !== false;
  const initGit = options.git !== false;

  const spinner = ora(`Creating Teloce project: ${projectName}...`).start();

  try {
    // Validate template
    const template = TEMPLATES[templateName as keyof typeof TEMPLATES];
    if (!template) {
      spinner.fail(`Template "${templateName}" not found`);
      console.log(chalk.yellow(`Available templates: ${Object.keys(TEMPLATES).join(', ')}`));
      process.exit(1);
    }

    // Create project directory
    const projectPath = path.join(process.cwd(), projectName);
    if (await fs.pathExists(projectPath)) {
      spinner.fail(`Directory "${projectName}" already exists`);
      process.exit(1);
    }

    await fs.ensureDir(projectPath);

    // Create files from template
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = path.join(projectPath, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content);
    }

    // Create package.json
    const packageJson = {
      name: projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'teloce dev',
        build: 'teloce build',
        debug: 'teloce debug',
      },
      dependencies: {
        teloce: 'latest',
      },
      devDependencies: {
        '@teloce/cli': 'latest',
      },
    };
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    spinner.succeed(`Project "${projectName}" created`);

    console.log(chalk.green(`\n✅ Project created successfully!`));
    console.log(chalk.blue(`   Name:     ${projectName}`));
    console.log(chalk.blue(`   Template: ${templateName}`));
    console.log(chalk.blue(`   Path:     ${projectPath}`));

    console.log(chalk.gray('\n📁 Project structure:'));
    console.log(chalk.gray(`   ${projectName}/`));
    for (const file of Object.keys(template.files)) {
      console.log(chalk.gray(`   ├── ${file}`));
    }
    console.log(chalk.gray(`   ├── package.json`));

    // Initialize git
    if (initGit) {
      try {
        await execAsync('git init', { cwd: projectPath });
        await execAsync('git add .', { cwd: projectPath });
        await execAsync('git commit -m "Initial commit"', { cwd: projectPath });
        console.log(chalk.gray('\n🔧 Git initialized'));
      } catch {
        console.log(chalk.yellow('\n⚠️  Git initialization skipped'));
      }
    }

    // Install dependencies
    if (installDeps) {
      console.log(chalk.gray('\n📦 Installing dependencies...'));
      try {
        await execAsync('npm install', { cwd: projectPath });
        console.log(chalk.green('✅ Dependencies installed'));
      } catch {
        console.log(chalk.yellow('⚠️  Failed to install dependencies. Run: npm install'));
      }
    }

    console.log(chalk.gray('\n🚀 Next steps:'));
    console.log(chalk.gray(`   cd ${projectName}`));
    console.log(chalk.gray('   npm run dev'));
    console.log(chalk.gray('   npm run build'));
    console.log(chalk.gray('   npm run debug'));

  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}