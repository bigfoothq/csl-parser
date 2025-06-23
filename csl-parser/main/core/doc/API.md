20250123

# CSL Parser API

## Functions

### parse(text, options?)

Parses CSL text into an Abstract Syntax Tree (AST).

**Parameters:**
- `text` (string): The CSL text to parse
- `options` (object, optional):
  - `startDelimiter` (string): Custom start delimiter (default: `<---`)
  - `endDelimiter` (string): Custom end delimiter (default: `--->`)

**Returns:** 
- Array of Operation objects (see TYPES.md)

**Throws:** 
- Error with message format: `"Line {lineNumber}: {errorMessage}"`
- Throws on first syntax error encountered

**Example:**
```javascript
import { parse } from './src/parser.js';

const ast = parse(cslText);
// or with custom delimiters
const ast = parse(cslText, {
  startDelimiter: '<<<',
  endDelimiter: '>>>'
});
```

### validate(ast)

Validates an AST for semantic correctness.

**Parameters:**
- `ast` (Array): The AST returned by parse()

**Returns:**
- Array of ValidationError objects (empty if valid)

**ValidationError structure:**
```javascript
{
  line: number,        // Line number from AST
  operation: string,   // Operation type
  error: string,       // Error message
  field?: string       // Optional field name
}
```

**Example:**
```javascript
import { validate } from './src/validator.js';

const errors = validate(ast);
if (errors.length > 0) {
  errors.forEach(error => {
    console.error(`Line ${error.line}: ${error.error}`);
  });
}
```