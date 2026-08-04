import { describe, expect, it } from 'vitest';
import { getDiagnostics, validateTemplate } from '../../packages/language-service/src/capabilities/diagnostics';

describe('language service diagnostics', () => {
  it('returns no diagnostics for balanced template content', () => {
    const diagnostics = getDiagnostics('<div><span>{{ message }}</span></div>');

    expect(diagnostics).toEqual([]);
  });

  it('reports unmatched template delimiters', () => {
    const diagnostics = getDiagnostics('<div>{{ message</div>');

    expect(diagnostics.some((diagnostic) => diagnostic.message.includes('Unmatched'))).toBe(true);
  });

  it('validates templates through the public alias', () => {
    expect(validateTemplate('<p>Hello</p>')).toEqual([]);
  });
});
