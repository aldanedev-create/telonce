/**
 * Diagnostic Provider - Provides real-time validation for Teloce templates
 */

import * as vscode from 'vscode';
import { getDiagnostics, type Diagnostic } from '@teloce/language-service';

export class TeloceDiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private timer: NodeJS.Timeout | null = null;
  private enabled: boolean = true;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('teloce');
  }

  async provideDiagnostics(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): Promise<vscode.Diagnostic[]> {
    if (!this.enabled || document.languageId !== 'teloce') {
      return [];
    }

    try {
      const content = document.getText();
      const diagnostics = getDiagnostics(content, document.uri.toString());
      const vsCodeDiagnostics = diagnostics.map(d => this.convertDiagnostic(d, document));
      
      this.diagnosticCollection.set(document.uri, vsCodeDiagnostics);
      return vsCodeDiagnostics;
    } catch (error) {
      console.error('Diagnostic error:', error);
      return [];
    }
  }

  private convertDiagnostic(
    diagnostic: Diagnostic,
    document: vscode.TextDocument
  ): vscode.Diagnostic {
    const severity = this.convertSeverity(diagnostic.severity);
    const range = new vscode.Range(
      new vscode.Position(diagnostic.range.start.line, diagnostic.range.start.character),
      new vscode.Position(diagnostic.range.end.line, diagnostic.range.end.character)
    );

    const vsDiagnostic = new vscode.Diagnostic(
      range,
      diagnostic.message,
      severity
    );

    vsDiagnostic.code = diagnostic.code;
    vsDiagnostic.source = diagnostic.source || 'teloce';

    if (diagnostic.fix) {
      vsDiagnostic.relatedInformation = [
        new vscode.DiagnosticRelatedInformation(
          new vscode.Location(document.uri, range),
          `💡 Fix: ${diagnostic.fix}`
        )
      ];
    }

    return vsDiagnostic;
  }

  private convertSeverity(severity: string): vscode.DiagnosticSeverity {
    const map: Record<string, vscode.DiagnosticSeverity> = {
      error: vscode.DiagnosticSeverity.Error,
      warning: vscode.DiagnosticSeverity.Warning,
      info: vscode.DiagnosticSeverity.Information,
      hint: vscode.DiagnosticSeverity.Hint,
    };
    return map[severity] || vscode.DiagnosticSeverity.Information;
  }

  startMonitoring() {
    // Monitor open documents
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      this.provideDiagnostics(activeEditor.document, new vscode.CancellationTokenSource().token);
    }

    // Watch for document changes
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.languageId === 'teloce') {
        this.scheduleDiagnostics(event.document);
      }
    });

    vscode.workspace.onDidOpenTextDocument((document) => {
      if (document.languageId === 'teloce') {
        this.scheduleDiagnostics(document);
      }
    });

    vscode.workspace.onDidSaveTextDocument((document) => {
      if (document.languageId === 'teloce') {
        this.scheduleDiagnostics(document);
      }
    });
  }

  private scheduleDiagnostics(document: vscode.TextDocument) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.provideDiagnostics(document, new vscode.CancellationTokenSource().token);
      this.timer = null;
    }, 500);
  }

  dispose() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.diagnosticCollection.dispose();
  }
}