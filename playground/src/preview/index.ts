/**
 * Preview Manager - Manages the preview iframe
 */

export interface PreviewOptions {
  onError?: (error: { message: string; fix?: string }) => void;
  onLoad?: () => void;
}

export interface PreviewRenderOptions {
  config?: string;
}

export class PreviewManager {
  private iframe: HTMLIFrameElement;
  private options: PreviewOptions;
  private isReady: boolean = false;
  private pendingRender: string | null = null;

  constructor(iframe: HTMLIFrameElement, options: PreviewOptions = {}) {
    this.iframe = iframe;
    this.options = options;

    this.setupIframe();
  }

  private setupIframe() {
    // Listen for messages from iframe
    window.addEventListener('message', (event) => {
      if (event.source !== this.iframe.contentWindow) return;

      const data = event.data;

      switch (data.type) {
        case 'ready':
          this.isReady = true;
          if (this.pendingRender) {
            this.sendRender(this.pendingRender);
            this.pendingRender = null;
          }
          if (this.options.onLoad) {
            this.options.onLoad();
          }
          break;

        case 'error':
          if (this.options.onError) {
            this.options.onError({
              message: data.message,
              fix: data.fix,
            });
          }
          break;

        case 'log':
          console.log('[preview]', data.message);
          break;
      }
    });

    // Listen for iframe load
    this.iframe.addEventListener('load', () => {
      // Iframe loaded
    });
  }

  /**
   * Render code in the preview
   */
  async render(code: string, options: PreviewRenderOptions = {}): Promise<void> {
    // Build the full HTML
    const html = this.buildHTML(code, options);

    if (this.isReady) {
      this.sendRender(html);
    } else {
      this.pendingRender = html;
      // Load the iframe
      this.iframe.src = 'about:blank';
    }
  }

  private buildHTML(code: string, options: PreviewRenderOptions): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teloce Playground</title>

  <!-- Teloce CDN -->
  <script src="https://cdn.teloce.dev/teloce.min.js"><\/script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      padding: 20px;
      background: #fff;
      color: #333;
    }
    #app { max-width: 100%; }
  </style>

  <!-- User Styles -->
  <style>
    ${this.extractStyle(code)}
  </style>
</head>
<body>
  <!-- User Template -->
  ${this.extractTemplate(code)}

  <!-- User Script -->
  <script>
    (function() {
      try {
        ${this.extractScript(code)}

        // Teloce config
        const config = ${options.config || '{}'};

        // Create app
        const app = teloce.createApp('#app', data || {}, config);

        // Send ready message
        window.parent.postMessage({ type: 'ready' }, '*');

        // Error handler
        window.onerror = function(message, source, line, col, error) {
          window.parent.postMessage({
            type: 'error',
            message: message,
            fix: 'Check your code for syntax errors.'
          }, '*');
        };
      } catch (error) {
        window.parent.postMessage({
          type: 'error',
          message: error.message,
          fix: 'Check your code for errors.'
        }, '*');
      }
    })();
  <\/script>
</body>
</html>
    `;
  }

  private extractTemplate(code: string): string {
    const match = code.match(/<template>([\s\S]*?)<\/template>/);
    return match ? match[1].trim() : '<div id="app"><h1>Hello Teloce!</h1></div>';
  }

  private extractScript(code: string): string {
    const match = code.match(/<script>([\s\S]*?)<\/script>/);
    return match ? match[1].trim() : `
const data = {
  title: 'Hello Teloce!',
  count: 0
};
    `;
  }

  private extractStyle(code: string): string {
    const match = code.match(/<style>([\s\S]*?)<\/style>/);
    return match ? match[1].trim() : '';
  }

  private sendRender(html: string) {
    if (!this.iframe.contentWindow) return;

    // Write to iframe
    const doc = this.iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }

  /**
   * Get the current HTML
   */
  getHTML(): string {
    return this.iframe.contentDocument?.documentElement?.outerHTML || '';
  }

  /**
   * Refresh the preview
   */
  refresh() {
    if (this.pendingRender) {
      this.sendRender(this.pendingRender);
    } else {
      this.iframe.src = 'about:blank';
    }
  }
}