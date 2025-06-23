20250123

# CSL Parser Usage

## Basic Usage

```javascript
import { parse } from './src/parser.js';
import { validate } from './src/validator.js';

// Parse CSL text
const ast = parse(cslText);  // Throws on syntax errors

// Validate AST
const errors = validate(ast); // Returns array of semantic errors
if (errors.length > 0) {
  // Handle validation errors
  errors.forEach(error => {
    console.error(`Line ${error.line}: ${error.error}`);
  });
}
```

## Error Handling

### Syntax Errors (Parser)
```javascript
try {
  const ast = parse(invalidCsl);
} catch (error) {
  // Parser throws on first syntax error
  console.error(error.message); // "Line 5: Unknown operation: INVALID"
}
```

### Semantic Errors (Validator)
```javascript
const ast = parse(validSyntaxBadSemantics);
const errors = validate(ast);
// Validator returns ALL errors
// [{line: 1, operation: 'WRITE', error: "Missing required attribute 'file'"}]
```

### Error Format Rationale

Parser throws strings for immediate developer feedback during parsing failures. Validator returns structured objects to enable programmatic error handling and bulk error reporting. This two-phase design separates syntax checking (fail-fast) from semantic validation (collect-all).

## Two-Phase Design

1. **Parse Phase**: Syntax and structure validation only
2. **Validation Phase**: Semantic and business rule validation

This separation enables:
- Tooling that works with syntactically valid but semantically invalid CSL
- Better error reporting (all semantic errors at once)
- Clearer module responsibilities