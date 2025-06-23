20250123

# CSL Parser Types

## AST Structure

```typescript
type Operation = {
  type: 'WRITE' | 'RUN' | 'SEARCH' | 'TASKS';
  line: number;
  
  // Attributes - all optional, flattened to top level
  file?: string;
  append?: string;
  dir?: string;
  count?: string;
  version?: string;
  
  // Content fields - presence depends on operation type
  content?: string;      // WRITE, RUN
  pattern?: string;      // SEARCH
  to?: string;           // SEARCH (optional)
  replacement?: string;  // SEARCH
  
  // TASKS only
  operations?: Operation[];
  
  // Extension point - any additional attributes
  [key: string]: any;
}

type AST = Operation[];
```

## Field Constraints by Operation Type

### WRITE
- Required: `type`, `line`, `file`, `content`
- Optional: `append`

### RUN  
- Required: `type`, `line`, `content`
- Optional: `dir`

### SEARCH
- Required: `type`, `line`, `file`, `pattern`, `replacement`
- Optional: `count`, `to`

### TASKS
- Required: `type`, `line`, `operations`
- Optional: `version`

## Notes

- Parser outputs may include invalid states (missing required fields) to enable better error messages
- Additional attributes from CSL are preserved as top-level properties
- All string values preserved exactly as parsed (no type coercion)
- Line numbers are 1-indexed

## Parser Output vs Valid Operations

Parser produces syntactically valid AST that may violate semantic rules:
- Missing required fields allowed
- Invalid attribute values allowed (e.g., count="invalid")
- Empty content where prohibited allowed

Validator ensures semantic validity per operation constraints.