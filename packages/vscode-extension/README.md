# Teloce VS Code Extension

> Teloce template language support for VS Code

This extension provides language support for Teloce templates (`.vel` files).

---

## Features

- **🔍 Syntax Highlighting** - Full syntax highlighting for Teloce templates
- **📋 Diagnostics** - Real-time validation and error detection
- **💡 Autocomplete** - Smart completions for directives, events, and bindings
- **📝 Hover Information** - Documentation on hover
- **🎨 Formatting** - Auto-format Teloce templates
- **🧩 Snippets** - Useful code snippets
- **📊 Symbol Support** - Document outline for components

---

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
3. Search for "Teloce"
4. Click Install

### From VSIX

```bash
code --install-extension teloce-vscode.vsix
Usage
Creating a .vel File
Create a new file with .vel extension:

html
<!-- Component.vel -->
<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <p>{{ content }}</p>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      title: 'Hello World',
      content: 'This is a Teloce component'
    };
  },
  methods: {
    handleClick() {
      alert('Clicked!');
    }
  }
};
</script>

<style scoped>
.card {
  padding: 20px;
  border: 1px solid #ccc;
}
</style>
Commands
Command	Description	Keybinding
teloce.format	Format Teloce template	Shift+Alt+F
teloce.validate	Validate template	-
teloce.openDebugger	Open Teloce debugger	-
Settings
Setting	Default	Description
teloce.format.indentSize	2	Number of spaces for indentation
teloce.format.useTabs	false	Use tabs instead of spaces
teloce.validate.enable	true	Enable validation
teloce.completion.enable	true	Enable autocompletion
teloce.debugger.host	localhost	Debugger host
teloce.debugger.port	9000	Debugger port
Contributing
Development
bash
# Clone the repository
git clone https://github.com/telocejs/teloce.git

# Install dependencies
pnpm install

# Build the extension
pnpm build

# Open in VS Code
code packages/vscode-extension

# Press F5 to debug
Publishing
bash
# Package the extension
pnpm vsce package

# Publish to marketplace
pnpm vsce publish
License
MIT


## Publishing to npm and VS Code Marketplace

### 1. Build the Language Service

```bash
cd packages/language-service
pnpm build
pnpm publish --access public
2. Package the VS Code Extension
bash
cd packages/vscode-extension
pnpm build
pnpm vsce package
3. Publish to VS Code Marketplace
bash
# First time - get a Personal Access Token from Azure DevOps
# Then login:
vsce login teloce

# Publish
pnpm vsce publish