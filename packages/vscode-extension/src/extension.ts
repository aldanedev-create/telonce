/**
 * Teloce VS Code Extension
 * 
 * This extension provides language support for Teloce templates
 * using the @teloce/language-service package.
 */

import * as vscode from 'vscode';
import {
  TeloceCompletionProvider,
  TeloceDiagnosticProvider,
  TeloceHoverProvider,
  TeloceFormattingProvider,
  TeloceSymbolProvider,
} from './providers/index.js';

import { registerCommands } from './commands/index.js';
/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('🐛 Teloce extension activated');

  const selector: vscode.DocumentSelector = [
    { language: 'teloce' },
    { language: 'html', scheme: 'file' },
  ];

  // Register completion provider
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      new TeloceCompletionProvider(),
      '@', ':', '|', ' ', '{'
    )
  );

  // Initialize diagnostic provider (manages its own DiagnosticCollection and workspace listeners)
  const diagnosticProvider = new TeloceDiagnosticProvider();

  // Register hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      selector,
      new TeloceHoverProvider()
    )
  );

  // Register formatting provider
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      selector,
      new TeloceFormattingProvider()
    )
  );

  // Register symbol provider
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      selector,
      new TeloceSymbolProvider()
    )
  );

  // Register commands
  registerCommands(context);

  // Start diagnostic monitoring
  diagnosticProvider.startMonitoring();

  // Show welcome message for first time
  const isFirstTime = context.globalState.get('teloce.firstTime', true);
  if (isFirstTime) {
    vscode.window.showInformationMessage(
      '🐛 Teloce extension activated! Create a .vel file to get started.'
    );
    context.globalState.update('teloce.firstTime', false);
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  console.log('🐛 Teloce extension deactivated');
}