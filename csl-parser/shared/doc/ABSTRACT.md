20250122

# CSL Parser Shared Utilities

Purpose: Zero-dependency constants and utilities for CSL (Clada Syntax Language) parsing.

Overview: Provides marker delimiters, operation names, and other constants used throughout the parser. No parsing logic, just shared definitions.

## Usage Pattern

```javascript
import { parse } from '../main/core/src/parser.js';
import { validate } from '../main/core/src/validator.js';

const ast = parse(cslText);  // Throws on syntax errors
const errors = validate(ast); // Returns array of semantic errors
if (errors.length > 0) {
  // Handle validation errors
}
```