import { describe, it, expect, vi } from 'vitest';

// Mock the 'vscode' module
vi.mock('vscode', () => import('./__mocks__/vscode'));

import * as vscode from 'vscode';

describe('VS Code Extension Tests', () => {
  it('triggers an information message', () => {
    vscode.window.showInformationMessage('Hello Telonce!');
    
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Hello Telonce!'
    );
  });
});