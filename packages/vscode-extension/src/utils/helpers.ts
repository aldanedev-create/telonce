import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function getDocumentContent(document: vscode.TextDocument): string {
  return document.getText();
}

export function getCursorPosition(editor: vscode.TextEditor): vscode.Position {
  return editor.selection.active;
}

export function getWordAtPosition(document: vscode.TextDocument, position: vscode.Position): string {
  const range = document.getWordRangeAtPosition(position);
  return range ? document.getText(range) : '';
}

export function getLineText(document: vscode.TextDocument, line: number): string {
  return document.lineAt(line).text;
}

export function getIndentation(lineText: string): string {
  const match = lineText.match(/^[\s]*/);
  return match ? match[0] : '';
}

export function getLanguageId(document: vscode.TextDocument): string {
  return document.languageId;
}

export function isTeloceFile(document: vscode.TextDocument): boolean {
  return document.languageId === 'teloce';
}

export function isHTMLFile(document: vscode.TextDocument): boolean {
  return document.languageId === 'html';
}

export function getFileExtension(filename: string): string {
  return path.extname(filename);
}

export function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

export function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration('teloce');
}

export function getConfigValue<T>(key: string, defaultValue: T): T {
  return getConfig().get<T>(key, defaultValue);
}

export async function setConfigValue(key: string, value: any): Promise<void> {
  await getConfig().update(key, value, true);
}

export function showErrorMessage(msg: string): void {
  vscode.window.showErrorMessage(msg);
}

export function showWarningMessage(msg: string): void {
  vscode.window.showWarningMessage(msg);
}

export function showInfoMessage(msg: string): void {
  vscode.window.showInformationMessage(msg);
}

export function showStatusMessage(msg: string): vscode.Disposable {
  return vscode.window.setStatusBarMessage(msg);
}

export async function withProgress<T>(title: string, task: () => Promise<T>): Promise<T> {
  return vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title }, task);
}

export function formatDuration(ms: number): string {
  return `${ms}ms`;
}

export function formatFileSize(bytes: number): string {
  return `${bytes} B`;
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function unescapeHtml(str: string): string {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export function trimLines(str: string): string {
  return str.split('\n').map(l => l.trim()).join('\n');
}

export function dedent(str: string): string {
  return str;
}

export function normalizePath(p: string): string {
  return path.normalize(p);
}

export function isPathRelative(p: string): boolean {
  return !path.isAbsolute(p);
}

export function isPathAbsolute(p: string): boolean {
  return path.isAbsolute(p);
}

export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

export function getAbsolutePath(p: string, root?: string): string {
  return path.resolve(root || '', p);
}

export function fileExists(p: string): boolean {
  return fs.existsSync(p) && fs.statSync(p).isFile();
}

export function directoryExists(p: string): boolean {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

export function readFile(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

export function writeFile(p: string, content: string): void {
  fs.writeFileSync(p, content, 'utf8');
}

export function createTempFile(prefix: string): string {
  return path.join(os.tmpdir(), `${prefix}-${Date.now()}`);
}

export function deleteTempFile(p: string): void {
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

export function getTempDir(): string {
  return os.tmpdir();
}