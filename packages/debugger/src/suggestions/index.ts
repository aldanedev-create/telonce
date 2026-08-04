/**
 * Suggestions Engine - "Did you mean...?" fix engine
 */

export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface FixSuggestion {
  /**
   * Suggestion text
   */
  text: string;

  /**
   * Priority
   */
  priority: SuggestionPriority;

  /**
   * Code to fix the issue
   */
  fixCode?: string;

  /**
   * Original code that needs fixing
   */
  originalCode?: string;

  /**
   * Explanation of the fix
   */
  explanation?: string;

  /**
   * Related documentation URL
   */
  docs?: string;
}

export interface SuggestionEngine {
  /**
   * Generate suggestions for an error
   */
  suggest: (error: Error | string) => FixSuggestion[];

  /**
   * Get the best suggestion
   */
  suggestBest: (error: Error | string) => FixSuggestion | undefined;
}

/**
 * Common typo mappings
 */
const typoMap: Record<string, string[]> = {
  'teloce': ['telose', 'teloce', 'teloce'],
  'createApp': ['createApp', 'createApp', 'createApp'],
  'createSignal': ['createSignal', 'createsignal', 'createSignal'],
  'createEffect': ['createEffect', 'createeffect', 'createEffect'],
  'computed': ['computed', 'computed', 'compute'],
  'reactive': ['reactive', 'ractive', 'reactiv'],
};

/**
 * Generate suggestions for an error
 */
export function generateSuggestions(error: Error | string): FixSuggestion[] {
  const message = typeof error === 'string' ? error : error.message;
  const suggestions: FixSuggestion[] = [];

  // Check for common typos
  for (const [correct, typos] of Object.entries(typoMap)) {
    for (const typo of typos) {
      if (message.toLowerCase().includes(typo.toLowerCase())) {
        suggestions.push({
          text: `Did you mean "${correct}"?`,
          priority: 'high',
          fixCode: correct,
          originalCode: typo,
          explanation: `This appears to be a typo. "${typo}" should be "${correct}".`,
        });
      }
    }
  }

  // Check for missing imports
  if (message.includes('is not defined') || message.includes('Cannot find name')) {
    const nameMatch = message.match(/['"]?(\w+)['"]?/);
    if (nameMatch) {
      const name = nameMatch[1];
      suggestions.push({
        text: `Import "${name}" from the appropriate module.`,
        priority: 'high',
        fixCode: `import { ${name} } from '@teloce/core';`,
        explanation: `"${name}" needs to be imported before use.`,
      });
    }
  }

  // Check for missing semicolons
  if (message.includes('Unexpected token') || message.includes('Syntax error')) {
    suggestions.push({
      text: 'Add missing semicolon or check your syntax.',
      priority: 'medium',
      fixCode: ';',
      explanation: 'JavaScript often requires semicolons at the end of statements.',
    });
  }

  // Check for missing brackets
  if (message.includes('Unexpected token') && message.includes('{')) {
    suggestions.push({
      text: 'Check for missing or extra brackets.',
      priority: 'medium',
      explanation: 'Make sure all opening brackets have closing brackets.',
    });
  }

  // Generic suggestions
  if (suggestions.length === 0) {
    suggestions.push({
      text: 'Check the error message for specific details.',
      priority: 'low',
      explanation: 'This error doesn\'t match common patterns. Check your code carefully.',
    });
    suggestions.push({
      text: 'Use the Teloce debugger dashboard for more details.',
      priority: 'low',
      docs: 'Run `teloce debug` to open the debugger.',
    });
  }

  return suggestions;
}

/**
 * Get the best suggestion for an error
 */
export function getFixSuggestions(error: Error | string): FixSuggestion[] {
  return generateSuggestions(error);
}

/**
 * Create a suggestion engine
 */
export function createSuggestionEngine(): SuggestionEngine {
  return {
    suggest(error: Error | string): FixSuggestion[] {
      return generateSuggestions(error);
    },

    suggestBest(error: Error | string): FixSuggestion | undefined {
      const suggestions = generateSuggestions(error);
      const highPriority = suggestions.filter(s => s.priority === 'high');
      return highPriority.length > 0 ? highPriority[0] : suggestions[0];
    },
  };
}