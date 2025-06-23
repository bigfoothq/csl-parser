# CSL Parser API

## Functions

### parse(text, options?)

Parses and validates CSL text, returning both AST and validation errors.

**Parameters:**
- `text` (string): The CSL text to parse
- `options` (object, optional):
  - `startDelimiter` (string): Custom start delimiter (default: `<---`)
  - `endDelimiter` (string): Custom end delimiter (default: `--->`)

**Returns:** 
```typescript
{
  ast: Operation[],              // Parsed AST (see TYPES.md)
  validationErrors: ValidationError[]  // Semantic errors (empty if valid)
}
```

**Throws:** 
- Error on syntax errors with format: `"Line {lineNumber}: {errorMessage}"`
- Does NOT throw on validation errors (returns them in result)

**Example:**
```javascript
import { parse } from './index.js';

try {
  const { ast, validationErrors } = parse(cslText);
  
  if (validationErrors.length > 0) {
    // Handle validation errors - can still execute valid operations
    validationErrors.forEach(error => {
      console.warn(`Line ${error.line}: ${error.error}`);
    });
  }
  
  // Execute operations that don't have validation errors
  executeAst(ast, validationErrors);
} catch (error) {
  // Syntax error - cannot proceed
  console.error('Parse failed:', error.message);
}
```

### ValidationError Structure

```typescript
{
  line: number,           // Line number from AST
  operation: string,      // Operation type
  error: string,          // Error message
  field?: string,         // Optional field name
  parentTaskLine?: number // Line of parent TASKS (if nested)
}
```

## Execution Model

- **Syntax errors**: Fatal - entire file is unparseable
- **Validation errors**: Non-fatal - skip failed operations
- **TASKS atomicity**: If any operation in a TASKS block has validation errors, skip the entire TASKS block

## Internal Functions

The following functions are used internally and not part of the public API:
- `parser.parse()` - Internal parsing logic
- `validator.validate()` - Internal validation logic