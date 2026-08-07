/**
 * Teloce Playground - Main Entry Point
 * 
 * This is the main application for the Teloce Playground.
 * It manages the editor, preview, and communication between them.
 */

import { EditorManager } from './editor';
import { PreviewManager } from './preview';
import { EXAMPLES } from './examples';

// --- Types ---

interface PlaygroundState {
  activeTab: 'template' | 'script' | 'style' | 'config';
  code: {
    template: string;
    script: string;
    style: string;
    config: string;
  };
  currentExample: string;
  theme: 'light' | 'dark';
  isRunning: boolean;
  errors: Array<{ message: string; line?: number; column?: number; fix?: string }>;
  compileTime: number;
}

// --- DOM References ---

const $ = (sel: string) => document.querySelector(sel);
const $$ = (sel: string) => document.querySelectorAll(sel);

const elements = {
  // Editor
  editorContainer: $('#editorContainer') as HTMLElement,
  editorTabs: $$('.editor-tab'),
  errorCount: $('#errorCount') as HTMLElement,

  // Preview
  previewFrame: $('#previewFrame') as HTMLIFrameElement,
  previewOverlay: $('#previewOverlay') as HTMLElement,
  errorMessage: $('#errorMessage') as HTMLElement,
  errorFixText: $('#errorFixText') as HTMLElement,
  statusDot: $('#statusDot') as HTMLElement,
  statusText: $('#statusText') as HTMLElement,

  // Status bar
  fileName: $('#fileName') as HTMLElement,
  lineNum: $('#lineNum') as HTMLElement,
  colNum: $('#colNum') as HTMLElement,
  compileTime: $('#compileTime') as HTMLElement,
  bundleSize: $('#bundleSize') as HTMLElement,

  // Buttons
  resetBtn: $('#resetBtn') as HTMLElement,
  exportBtn: $('#exportBtn') as HTMLElement,
  shareBtn: $('#shareBtn') as HTMLElement,
  themeBtn: $('#themeBtn') as HTMLElement,
};

// --- State ---

const state: PlaygroundState = {
  activeTab: 'template',
  code: {
    template: '',
    script: '',
    style: '',
    config: '',
  },
  currentExample: 'counter',
  theme: 'dark',
  isRunning: false,
  errors: [],
  compileTime: 0,
};

// --- Initialize ---

let editor: EditorManager;
let preview: PreviewManager;

async function init() {
  try {
    // Create editor
    editor = new EditorManager(elements.editorContainer, {
      theme: state.theme,
      onContentChange: handleEditorChange,
      onCursorChange: handleCursorChange,
    });

    // Create preview
    preview = new PreviewManager(elements.previewFrame, {
      onError: handlePreviewError,
      onLoad: handlePreviewLoad,
    });

    // Load default example
    loadExample('counter');

    // Setup event listeners
    setupEventListeners();

    // Initial render
    await renderPreview();

    console.log('🚀 Teloce Playground initialized!');
  } catch (error) {
    console.error('Failed to initialize playground:', error);
  }
}

// --- Example Loading ---

function loadExample(name: string) {
  const example = (EXAMPLES as Record<string, any>)[name];
  if (!example) return;

  state.currentExample = name;
  state.code = {
    template: example.template || '',
    script: example.script || '',
    style: example.style || '',
    config: example.config || '',
  };

  // Update editor
  editor.setCode(getActiveCode());

  // Update file name
  elements.fileName.textContent = `${name}.vel`;

  // Render preview
  renderPreview();
}

function getActiveCode(): string {
  switch (state.activeTab) {
    case 'template':
      return state.code.template;
    case 'script':
      return state.code.script;
    case 'style':
      return state.code.style;
    case 'config':
      return state.code.config;
    default:
      return '';
  }
}

function setActiveCode(code: string) {
  switch (state.activeTab) {
    case 'template':
      state.code.template = code;
      break;
    case 'script':
      state.code.script = code;
      break;
    case 'style':
      state.code.style = code;
      break;
    case 'config':
      state.code.config = code;
      break;
  }
}

// --- Preview Rendering ---

async function renderPreview() {
  const startTime = performance.now();

  try {
    state.isRunning = true;
    setStatus('loading', 'Compiling...');

    // Build the complete file
    const fullCode = `
<template>
${state.code.template}
</template>

<script>
${state.code.script}
</script>

<style>
${state.code.style}
</style>
`;

    // Compile and render
    await preview.render(fullCode, {
      config: state.code.config,
    });

    const endTime = performance.now();
    state.compileTime = endTime - startTime;
    elements.compileTime.textContent = `${Math.round(state.compileTime)}ms`;

    setStatus('success', 'Ready');
    hideError();

    state.isRunning = false;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showError(message);
    setStatus('error', 'Error');
    state.isRunning = false;
  }
}

// --- Status Management ---

function setStatus(type: 'loading' | 'success' | 'error', text: string) {
  elements.statusDot.className = `dot ${type}`;
  elements.statusText.textContent = text;
}

function showError(message: string, fix?: string) {
  elements.errorMessage.textContent = message;
  if (fix) {
    elements.errorFixText.textContent = fix;
    if (elements.errorFixText.parentElement) {
      elements.errorFixText.parentElement.style.display = 'block';
    }
  } else {
    if (elements.errorFixText.parentElement) {
      elements.errorFixText.parentElement.style.display = 'none';
    }
  }
  elements.previewOverlay.classList.add('show');
}

function hideError() {
  elements.previewOverlay.classList.remove('show');
}

// --- Event Handlers ---

function handleEditorChange(code: string) {
  setActiveCode(code);
  updateErrorCount();

  // Debounce preview render
  clearTimeout((window as any)._renderTimeout);
  (window as any)._renderTimeout = setTimeout(() => {
    renderPreview();
  }, 500);
}

function handleCursorChange(line: number, col: number) {
  elements.lineNum.textContent = String(line + 1);
  elements.colNum.textContent = String(col + 1);
}

function handlePreviewError(error: { message: string; fix?: string }) {
  state.errors.push(error);
  updateErrorCount();
  showError(error.message, error.fix);
}

function handlePreviewLoad() {
  // Preview loaded successfully
}

function updateErrorCount() {
  const count = state.errors.length;
  elements.errorCount.textContent = String(count);
  elements.errorCount.style.color = count > 0 ? 'var(--accent-red)' : 'var(--text-muted)';
}

// --- Event Listeners ---

function setupEventListeners() {
  // Tab switching
  elements.editorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = (tab as HTMLElement).dataset.tab as PlaygroundState['activeTab'];
      switchTab(tabName);
    });
  });

  // Reset button
  elements.resetBtn.addEventListener('click', () => {
    loadExample(state.currentExample);
  });

  // Export button
  elements.exportBtn.addEventListener('click', exportPlayground);

  // Share button
  elements.shareBtn.addEventListener('click', sharePlayground);

  // Theme toggle
  elements.themeBtn.addEventListener('click', toggleTheme);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Enter or Cmd+Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      renderPreview();
    }
    // Ctrl+S or Cmd+S to export
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      exportPlayground();
    }
  });
}

function switchTab(tab: PlaygroundState['activeTab']) {
  state.activeTab = tab;

  // Update tab UI
  elements.editorTabs.forEach(el => {
    el.classList.toggle('active', (el as HTMLElement).dataset.tab === tab);
  });

  // Update editor content
  editor.setCode(getActiveCode());
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  editor.setTheme(state.theme);
  elements.themeBtn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
}

// --- Export & Share ---

function exportPlayground() {
  const html = preview.getHTML();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.currentExample}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function sharePlayground() {
  // Encode state in URL
  const data = {
    example: state.currentExample,
    code: state.code,
  };
  const encoded = btoa(JSON.stringify(data));
  const url = `${window.location.origin}?state=${encoded}`;

  // Copy to clipboard
  navigator.clipboard.writeText(url).then(() => {
    alert('Share URL copied to clipboard!');
  }).catch(() => {
    prompt('Copy this URL to share:', url);
  });
}

// --- Start ---

init();