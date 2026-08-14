# @teloce/cli


<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>



**Author:** Aldane Hutchinson

 teloce:  A JavaScript template engine for Python web developers.

> Command-line interface for Teloce — develop, build, debug, and create Teloce projects.

---

## Overview

The Teloce CLI provides a set of commands to streamline your Teloce development workflow. It includes:

* Development server with hot reload
* Production builds
* Human-friendly debugger
* Project scaffolding
* Environment and configuration checks
* Template linting
* File watching and automatic rebuilding

---

## Installation

### Global Installation

```bash
npm install -g @teloce/cli
```

### Local Installation — Recommended

```bash
npm install --save-dev @teloce/cli
```

### Using pnpm

```bash
pnpm add -D @teloce/cli
```

### Using yarn

```bash
yarn add -D @teloce/cli
```

---

# Commands

| Command         | Description                                |
| --------------- | ------------------------------------------ |
| `teloce dev`    | Start development server with hot reload   |
| `teloce build`  | Build for production                       |
| `teloce debug`  | Open the human-friendly debugger dashboard |
| `teloce create` | Scaffold a new Teloce project              |
| `teloce doctor` | Check environment and configuration        |
| `teloce lint`   | Lint Teloce templates                      |
| `teloce watch`  | Watch for changes and rebuild              |

---

# `teloce dev`

Start a development server with **Hot Module Replacement (HMR)** and live reload.

## Usage

```bash
teloce dev [options]
```

## Options

| Option              | Description                         | Default       |
| ------------------- | ----------------------------------- | ------------- |
| `-p, --port <port>` | Port to run the server on           | `5173`        |
| `-h, --host <host>` | Host to bind to                     | `localhost`   |
| `--no-hmr`          | Disable Hot Module Replacement      | Enabled       |
| `--proxy <target>`  | Proxy target URL for Python backend | Auto-detected |

## Examples

```bash
# Start dev server on default port
teloce dev

# Start on a custom port
teloce dev --port 3000

# Start without HMR
teloce dev --no-hmr

# Proxy to a Flask backend
teloce dev --proxy http://localhost:5000

# Proxy to a Django backend
teloce dev --proxy http://localhost:8000
```

## Auto-Detection

The CLI can automatically detect supported Python frameworks:

| Framework   | Detected By                 | Proxy Target            |
| ----------- | --------------------------- | ----------------------- |
| **Flask**   | `app.py` + `templates/`     | `http://localhost:5000` |
| **Django**  | `manage.py`                 | `http://localhost:8000` |
| **FastAPI** | `main.py` + FastAPI imports | `http://localhost:8000` |
| **Quart**   | `app.py` + Quart imports    | `http://localhost:5000` |
| **Flaxon**  | `app.py` + Flaxon imports   | `http://localhost:8080` |

---

# `teloce build`

Build your Teloce project for production.

## Usage

```bash
teloce build [options]
```

## Options

| Option                | Description             | Default |
| --------------------- | ----------------------- | ------- |
| `-o, --out-dir <dir>` | Output directory        | `dist`  |
| `--minify`            | Minify output           | Enabled |
| `--no-minify`         | Disable minification    | —       |
| `--source-map`        | Generate source maps    | `false` |
| `--chunks`            | Enable chunk splitting  | Enabled |
| `--no-chunks`         | Disable chunk splitting | —       |

## Examples

```bash
# Build for production
teloce build

# Build to a custom directory
teloce build --out-dir build

# Build without minification
teloce build --no-minify

# Build with source maps
teloce build --source-map
```

---

# `teloce debug`

Open the human-friendly debugger dashboard.

## Usage

```bash
teloce debug [options]
```

## Options

| Option              | Description                           | Default     |
| ------------------- | ------------------------------------- | ----------- |
| `-p, --port <port>` | Port for the debugger                 | `9000`      |
| `-h, --host <host>` | Host for the debugger                 | `localhost` |
| `--no-open`         | Do not automatically open the browser | `false`     |

## Examples

```bash
# Open debugger on default port
teloce debug

# Open on a custom port
teloce debug --port 9001

# Start without opening the browser
teloce debug --no-open
```

## Debugger Features

| Feature                    | Description                                  |
| -------------------------- | -------------------------------------------- |
| **Human-Friendly Errors**  | Translates cryptic errors into plain English |
| **Component Inspector**    | View the component tree and state            |
| **Performance Monitoring** | Monitor FPS, memory, and render times        |
| **Live State Viewer**      | Inspect reactive state in real time          |
| **Error Suggestions**      | Provides "Did you mean...?" suggestions      |

---

# `teloce create`

Scaffold a new Teloce project.

## Usage

```bash
teloce create [name] [options]
```

## Options

| Option                      | Description                  | Default |
| --------------------------- | ---------------------------- | ------- |
| `-t, --template <template>` | Project template             | `flask` |
| `--no-install`              | Skip dependency installation | `false` |
| `--no-git`                  | Skip Git initialization      | `false` |

## Templates

| Template  | Description              |
| --------- | ------------------------ |
| `flask`   | Flask + Teloce project   |
| `django`  | Django + Teloce project  |
| `fastapi` | FastAPI + Teloce project |
| `quart`   | Quart + Teloce project   |
| `flaxon`  | Flaxon + Teloce project  |

## Examples

```bash
# Create a Flask project
teloce create my-app

# Create a Django project
teloce create my-app --template django

# Create a FastAPI project
teloce create my-app --template fastapi

# Create without installing dependencies
teloce create my-app --no-install

# Create without initializing Git
teloce create my-app --no-git
```

## Generated Structure

```text
my-app/
├── app.py
├── templates/
│   └── index.html
├── static/
│   ├── css/
│   └── js/
├── package.json
└── requirements.txt
```

---

# `teloce doctor`

Check your environment and project configuration.

## Usage

```bash
teloce doctor [options]
```

## Options

| Option          | Description         | Default |
| --------------- | ------------------- | ------- |
| `-v, --verbose` | Show verbose output | `false` |

## Examples

```bash
# Run doctor checks
teloce doctor

# Run with verbose output
teloce doctor --verbose
```

## Checks Performed

| Check                | Description                                             |
| -------------------- | ------------------------------------------------------- |
| **Node.js Version**  | Checks whether Node.js is installed and up to date      |
| **npm / pnpm**       | Checks whether a supported package manager is available |
| **Teloce**           | Checks whether Teloce is installed                      |
| **Python Framework** | Detects the Python framework used by the project        |
| **Configuration**    | Validates `teloce.config.ts`                            |

---

# `teloce lint`

Lint your Teloce templates.

## Usage

```bash
teloce lint [options]
```

## Options

| Option      | Description                      | Default |
| ----------- | -------------------------------- | ------- |
| `-f, --fix` | Automatically fix linting issues | `false` |
| `--strict`  | Enable strict linting mode       | `false` |

## Examples

```bash
# Lint templates
teloce lint

# Fix linting issues
teloce lint --fix

# Enable strict linting
teloce lint --strict
```

## Linting Rules

| Rule                    | Description                                         |
| ----------------------- | --------------------------------------------------- |
| **Missing Key**         | Loops should have a `key` attribute                 |
| **Empty Interpolation** | `{{ }}` should contain a variable                   |
| **Unclosed Tags**       | All `<for>` and `<if>` tags must be properly closed |
| **Unused Variables**    | Variables defined but never used                    |

---

# `teloce watch`

Watch for changes and rebuild automatically.

## Usage

```bash
teloce watch [options]
```

## Options

| Option                | Description                    | Default |
| --------------------- | ------------------------------ | ------- |
| `-o, --out-dir <dir>` | Output directory               | `dist`  |
| `--no-hmr`            | Disable Hot Module Replacement | `false` |

## Examples

```bash
# Watch and rebuild
teloce watch

# Watch with custom output directory
teloce watch --out-dir build

# Watch without HMR
teloce watch --no-hmr
```

---

# Configuration

## `teloce.config.ts`

Create a `teloce.config.ts` file in your project root to customize CLI behavior:

```typescript
import { defineConfig } from "@teloce/cli";

export default defineConfig({
  // Development server
  devServer: {
    port: 5173,
    host: "localhost",
    open: true,
    hotReload: true,
    proxy: "http://localhost:5000",
    staticFolder: "static",
  },

  // Build settings
  build: {
    outDir: "dist",
    minify: true,
    sourceMap: false,
    chunkSplitting: true,
    treeShaking: true,
  },

  // Debugger settings
  debugger: {
    port: 9000,
    host: "localhost",
    open: true,
  },

  // Compiler settings
  compiler: {
    target: "es2020",
    strictMode: true,
  },

  // Framework settings
  framework: {
    autoDetect: true,
  },
});
```

---

# Integration with Python Frameworks

## Flask

```python
# app.py

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html", name="World")


if __name__ == "__main__":
    app.run(debug=True)
```

Run Flask and Teloce together:

```bash
teloce dev --proxy http://localhost:5000
```

## Django

Start Django and Teloce together:

```bash
python manage.py runserver
```

In another terminal:

```bash
teloce dev --proxy http://localhost:8000
```

## FastAPI

Start FastAPI:

```bash
uvicorn main:app --reload
```

In another terminal:

```bash
teloce dev --proxy http://localhost:8000
```

---

# Exit Codes

| Code | Meaning             |
| ---: | ------------------- |
|  `0` | Success             |
|  `1` | General error       |
|  `2` | Command not found   |
|  `3` | Configuration error |
|  `4` | Build failed        |
|  `5` | Linting failed      |
|  `6` | Connection error    |

---

# Troubleshooting

## Port Already in Use

Use a different port:

```bash
teloce dev --port 5174
```

## Proxy Not Working

Make sure your Python server is running and explicitly specify the proxy:

```bash
teloce dev --proxy http://localhost:5000
```

## HMR Not Working

Try disabling HMR:

```bash
teloce dev --no-hmr
```

---

# License

MIT

---

# Links

* [Teloce Website](https://teloce.dev)
* [Teloce GitHub](https://github.com/telocejs/teloce)
* [Teloce Documentation](https://docs.teloce.dev)
