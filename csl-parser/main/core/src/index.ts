import { parse as parseInternal } from './parser.js';
import type { Operation, ParseOptions } from './parser.js';
import { validate } from './validator.js';
import type { ValidationError } from './validator.js';

export interface ParseResult {
  ast: Operation[];
  validationErrors: ValidationError[];
}

/**
 * Parses and validates CSL text into AST with validation errors.
 * Throws on syntax errors (unparseable), returns validation errors for semantic issues.
 * 
 * @param text CSL text to parse
 * @param options Optional parsing options (startDelimiter, endDelimiter)
 * @returns ParseResult containing AST and validation errors
 * @throws Error on syntax errors with format "Line {lineNumber}: {errorMessage}"
 */
export function parse(text: string, options?: ParseOptions): ParseResult {
  // Parse - throws on syntax error (catastrophic failure)
  const ast = parseInternal(text, options);
  
  // Validate - collects all semantic errors (recoverable failures)
  const validationErrors = validate(ast);
  
  return { ast, validationErrors };
}

// Re-export types needed by consumers
export type { Operation, ParseOptions } from './parser.js';
export type { ValidationError } from './validator.js';