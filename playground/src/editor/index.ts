/**
 * Editor Manager - Manages the code editor
 */

export interface EditorOptions {
  theme: 'light' | 'dark';
  fontSize?: number;
  tabSize?: number;
  onContentChange?: (code: string) => void;
  onCursorChange?: (line: number, col: number) => void;
}

export class EditorManager {
  private container: HTMLElement;
  private options: EditorOptions;
  private editor: any;
  private code: string = '';
  private isMounted: boolean = false;

  constructor(container: HTMLElement, options: EditorOptions) {
    this.container = container;
    this.options = {
      fontSize: 14,
      tabSize: 2,
      ...options,
    };

    this.init();
  }

  private async init() {
    try {
      // Dynamic import of Monaco Editor
      const monaco = await import('monaco-editor');

      // Create editor instance
      this.editor = monaco.editor.create(this.container, {
        value: this.code,
        language: 'html',
        theme: this.options.theme === 'dark' ? 'vs-dark' : 'vs',
        fontSize: this.options.fontSize,
        tabSize: this.options.tabSize,
        insertSpaces: true,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
        },
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        bracketMatching: 'always',
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        formatOnPaste: true,
        formatOnType: true,
        suggest: {
          showKeywords: true,
          showSnippets: true,
        },
      });

      // Setup event listeners
      this.editor.onDidChangeModelContent(() => {
        const code = this.editor.getValue();
        this.code = code;
        if (this.options.onContentChange) {
          this.options.onContentChange(code);
        }
      });

      this.editor.onDidChangeCursorPosition((e: any) => {
        if (this.options.onCursorChange) {
          this.options.onCursorChange(e.position.lineNumber - 1, e.position.column - 1);
        }
      });

      // Register Teloce language
      this.registerLanguage(monaco);

      this.isMounted = true;

      console.log('📝 Editor initialized');
    } catch (error) {
      console.error('Failed to initialize editor:', error);
      this.showFallbackEditor();
    }
  }

  private registerLanguage(monaco: any) {
    // Register Teloce language
    monaco.languages.register({
      id: 'teloce',
      extensions: ['.vel', '.teloce'],
      aliases: ['Teloce', 'teloce'],
      mimetypes: ['text/x-teloce'],
    });

    // Register tokens provider
    monaco.languages.setMonarchTokensProvider('teloce', {
      tokenizer: {
        root: [
          // Directives
          [/\b(for|if|else|show|hide|switch|case|slot|component)\b/, 'keyword'],
          // Events
          [/@\w+/, 'keyword'],
          // Bindings
          [/:[\w-]+/, 'keyword'],
          // Interpolation
          [/\{\{[\s\S]*?\}\}/, 'string'],
          // Comments
          [/<!--[\s\S]*?-->/, 'comment'],
          // Tags
          [/<[\w-]+/, 'tag'],
          [/<\/[\w-]+>/, 'tag'],
          // Attributes
          [/[\w-]+(?=\s*=)/, 'attribute'],
          // Strings
          [/"[^"]*"/, 'string'],
          [/'[^']*'/, 'string'],
        ],
      },
    });

    // Register theme
    monaco.editor.defineTheme('teloce-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'attribute', foreground: '9CDCFE' },
      ],
    });
  }

  private showFallbackEditor() {
    // Simple textarea fallback
    const textarea = document.createElement('textarea');
    textarea.style.width = '100%';
    textarea.style.height = '100%';
    textarea.style.background = '#1e1e1e';
    textarea.style.color = '#d4d4d4';
    textarea.style.border = 'none';
    textarea.style.padding = '16px';
    textarea.style.fontSize = '14px';
    textarea.style.fontFamily = 'monospace';
    textarea.style.resize = 'none';
    textarea.style.outline = 'none';
    textarea.value = this.code;

    textarea.addEventListener('input', () => {
      this.code = textarea.value;
      if (this.options.onContentChange) {
        this.options.onContentChange(this.code);
      }
    });

    this.container.innerHTML = '';
    this.container.appendChild(textarea);
  }

  /**
   * Set editor content
   */
  setCode(code: string) {
    this.code = code;
    if (this.editor) {
      this.editor.setValue(code);
    } else {
      // Fallback
      const textarea = this.container.querySelector('textarea');
      if (textarea) {
        textarea.value = code;
      }
    }
  }

  /**
   * Get editor content
   */
  getCode(): string {
    return this.code;
  }

  /**
   * Set theme
   */
  setTheme(theme: 'light' | 'dark') {
    this.options.theme = theme;
    if (this.editor) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }

  /**
   * Set font size
   */
  setFontSize(size: number) {
    this.options.fontSize = size;
    if (this.editor) {
      this.editor.updateOptions({ fontSize: size });
    }
  }

  /**
   * Focus editor
   */
  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  /**
   * Dispose editor
   */
  dispose() {
    if (this.editor) {
      this.editor.dispose();
    }
    this.isMounted = false;
  }
}