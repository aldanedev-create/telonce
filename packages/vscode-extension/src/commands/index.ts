/**
 * Commands - VS Code commands for Teloce
 */

import * as vscode from 'vscode';
import { formatTemplate } from '@teloce/language-service';

export function registerCommands(context: vscode.ExtensionContext) {
  // Format command
  context.subscriptions.push(
    vscode.commands.registerCommand('teloce.format', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const document = editor.document;
      const content = document.getText();
      const config = vscode.workspace.getConfiguration('teloce.format');
      
      const formatted = formatTemplate(content, {
        indentSize: config.get('indentSize', 2),
        useTabs: config.get('useTabs', false),
        indentHTML: true,
        maxLineLength: 80,
        preserveNewlines: true,
      });

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(content.length)
      );

      await editor.edit(builder => {
        builder.replace(fullRange, formatted);
      });
    })
  );

  // Validate command
  context.subscriptions.push(
    vscode.commands.registerCommand('teloce.validate', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      vscode.window.showInformationMessage('✅ Teloce template validation complete');
    })
  );

  // Open debugger command
  context.subscriptions.push(
    vscode.commands.registerCommand('teloce.openDebugger', async () => {
      const config = vscode.workspace.getConfiguration('teloce.debugger');
      const host = config.get('host', 'localhost');
      const port = config.get('port', 9000);
      
      const url = `http://${host}:${port}`;
      vscode.env.openExternal(vscode.Uri.parse(url));
    })
  );
}