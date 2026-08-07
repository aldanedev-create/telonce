/**
 * JSDoc Bridge - Parses and validates JSDoc annotations
 */

export interface JSDocResult {
  /**
   * Parsed JSDoc
   */
  parsed: JSDocTag[];

  /**
   * Validated types
   */
  types: JSDocType[];

  /**
   * Validation errors
   */
  errors: string[];

  /**
   * Validation warnings
   */
  warnings: string[];

  /**
   * Generated TypeScript definitions
   */
  generatedTypes: string;
}

export interface JSDocTag {
  /**
   * Tag name
   */
  name: string;

  /**
   * Tag type
   */
  type?: string;

  /**
   * Tag description
   */
  description?: string;

  /**
   * Tag value
   */
  value?: string;

  /**
   * Line number
   */
  line: number;
}

export interface JSDocType {
  /**
   * Type name
   */
  name: string;

  /**
   * Type kind
   */
  kind: 'primitive' | 'object' | 'array' | 'function' | 'union' | 'any';

  /**
   * Type properties (for objects)
   */
  properties?: JSDocType[];

  /**
   * Type value (for primitives)
   */
  value?: any;

  /**
   * Type documentation
   */
  doc?: string;
}

// Registry for custom JSDoc tag handlers
const customTagHandlers = new Map<string, (value: string) => JSDocTag | null>();

/**
 * Parse JSDoc annotations
 */
export function parseJSDoc(content: string): JSDocResult {
  const parsed: JSDocTag[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const types: JSDocType[] = [];

  // Parse @type, @param, @returns, @typedef, @property, and custom tags
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for JSDoc comment
    if (trimmed.includes('/**') || trimmed.includes('*')) {
      // Parse @type
      const typeMatch = trimmed.match(/@type\s+{([^}]+)}\s*(.*)/);
      if (typeMatch) {
        parsed.push({
          name: 'type',
          type: typeMatch[1],
          description: typeMatch[2] || '',
          line: i + 1,
        });

        // Parse the type
        const typeInfo = parseType(typeMatch[1]);
        if (typeInfo) {
          types.push(typeInfo);
        }
        continue;
      }

      // Parse @param
      const paramMatch = trimmed.match(/@param\s+{([^}]+)}\s*\[?(\w+)\]?\s*(.*)/);
      if (paramMatch) {
        parsed.push({
          name: 'param',
          type: paramMatch[1],
          value: paramMatch[2],
          description: paramMatch[3] || '',
          line: i + 1,
        });
        continue;
      }

      // Parse @returns
      const returnsMatch = trimmed.match(/@returns?\s+{([^}]+)}\s*(.*)/);
      if (returnsMatch) {
        parsed.push({
          name: 'returns',
          type: returnsMatch[1],
          description: returnsMatch[2] || '',
          line: i + 1,
        });
        continue;
      }

      // Parse @typedef
      const typedefMatch = trimmed.match(/@typedef\s+{([^}]+)}\s*(\w+)\s*(.*)/);
      if (typedefMatch) {
        parsed.push({
          name: 'typedef',
          type: typedefMatch[1],
          value: typedefMatch[2],
          description: typedefMatch[3] || '',
          line: i + 1,
        });
        continue;
      }

      // Parse @property
      const propertyMatch = trimmed.match(/@property\s+{([^}]+)}\s*(\w+)\s*(.*)/);
      if (propertyMatch) {
        parsed.push({
          name: 'property',
          type: propertyMatch[1],
          value: propertyMatch[2],
          description: propertyMatch[3] || '',
          line: i + 1,
        });
        continue;
      }

      // Parse registered custom tags
      const customMatch = trimmed.match(/@(\w+)\s+(.*)/);
      if (customMatch) {
        const tagName = customMatch[1];
        const tagValue = customMatch[2];
        if (customTagHandlers.has(tagName)) {
          const handler = customTagHandlers.get(tagName)!;
          const customTag = handler(tagValue);
          if (customTag) {
            parsed.push({
              ...customTag,
              line: i + 1,
            });
          }
        }
      }
    }
  }

  // Validate parsed JSDoc
  const validation = validateJSDoc(parsed);
  errors.push(...validation.errors);
  warnings.push(...validation.warnings);

  // Generate TypeScript definitions
  const generatedTypes = generateTypes(types);

  return {
    parsed,
    types,
    errors,
    warnings,
    generatedTypes,
  };
}

/**
 * Parse a type string
 */
function parseType(typeStr: string): JSDocType | null {
  const trimmed = typeStr.trim();

  // Check for primitive types
  const primitives = ['string', 'number', 'boolean', 'null', 'undefined', 'any', 'void'];
  if (primitives.includes(trimmed)) {
    return {
      name: trimmed,
      kind: 'primitive',
    };
  }

  // Check for array
  if (trimmed.endsWith('[]')) {
    const elementType = trimmed.slice(0, -2);
    const parsed = parseType(elementType);
    return {
      name: `${elementType}[]`,
      kind: 'array',
      properties: parsed ? [parsed] : [],
    };
  }

  // Check for union
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|').map(s => s.trim());
    const unionTypes = parts.map(p => parseType(p)).filter(Boolean) as JSDocType[];
    return {
      name: `(${parts.join(' | ')})`,
      kind: 'union',
      properties: unionTypes,
    };
  }

  // Check for object
  if (trimmed.includes('{')) {
    // Parse object properties
    const propMatch = trimmed.match(/\{([^}]+)\}/);
    if (propMatch) {
      const props = propMatch[1].split(',').map(s => s.trim());
      const properties: JSDocType[] = [];
      for (const prop of props) {
        const [name, type] = prop.split(':').map(s => s.trim());
        if (name && type) {
          const parsed = parseType(type);
          if (parsed) {
            properties.push({
              name,
              kind: parsed.kind,
              properties: parsed.properties,
            });
          }
        }
      }
      return {
        name: 'Object',
        kind: 'object',
        properties,
      };
    }
  }

  // Default - treat as identifier
  return {
    name: trimmed,
    kind: 'any',
  };
}

/**
 * Validate JSDoc annotations
 */
export function validateJSDoc(parsed: JSDocTag[]): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const tag of parsed) {
    if (tag.name === 'type' && !tag.type) {
      errors.push(`@type tag at line ${tag.line} has no type`);
    }
    if (tag.name === 'param' && !tag.type) {
      errors.push(`@param tag at line ${tag.line} has no type`);
    }
    if (tag.name === 'param' && !tag.value) {
      warnings.push(`@param tag at line ${tag.line} has no parameter name`);
    }
    if (tag.name === 'returns' && !tag.type) {
      errors.push(`@returns tag at line ${tag.line} has no type`);
    }
    if (tag.name === 'typedef' && !tag.value) {
      errors.push(`@typedef tag at line ${tag.line} has no name`);
    }
    if (tag.name === 'property' && !tag.value) {
      errors.push(`@property tag at line ${tag.line} has no property name`);
    }
  }

  return { errors, warnings };
}

/**
 * Generate TypeScript definitions from JSDoc types
 */
export function generateTypes(types: JSDocType[]): string {
  if (types.length === 0) return '';

  let result = '// Generated from JSDoc\n\n';

  for (const type of types) {
    if (type.kind === 'object') {
      result += `interface ${type.name} {\n`;
      if (type.properties) {
        for (const prop of type.properties) {
          const propType = prop.kind === 'object' ? prop.name : prop.kind;
          result += `  ${prop.name}: ${propType};\n`;
        }
      }
      result += '}\n\n';
    } else if (type.kind === 'union') {
      const unionTypes = type.properties?.map(p => p.name).join(' | ') || 'any';
      result += `type ${type.name} = ${unionTypes};\n\n`;
    } else if (type.kind === 'array') {
      const elementType = type.properties?.[0]?.name || 'any';
      result += `type ${type.name} = ${elementType}[];\n\n`;
    } else {
      result += `type ${type.name} = ${type.kind};\n\n`;
    }
  }

  return result;
}

/**
 * Register a custom JSDoc tag handler
 */
export function registerJSDocTagHandler(
  tagName: string,
  handler: (value: string) => JSDocTag | null
): void {
  customTagHandlers.set(tagName, handler);
}

/**
 * Create a JSDoc bridge
 */
export function createJSDocBridge() {
  return {
    parse: parseJSDoc,
    validate: validateJSDoc,
    generateTypes,
    registerTagHandler: registerJSDocTagHandler,
  };
}