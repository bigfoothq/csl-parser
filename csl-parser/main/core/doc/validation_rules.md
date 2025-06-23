20250123

# CSL Validation Rules

This document specifies all semantic validation rules enforced after parsing.

## Validation Philosophy

- Parser produces syntactically valid AST
- Validator checks semantic/business rules
- All errors collected in single pass
- No AST transformation during validation

## Operation-Specific Rules

### WRITE Operation
**Required attributes**: 
- `file`: Must be present (can be empty string)

**Optional attributes**:
- `append`: If present, must be "true" or "false"

**Content rules**:
- Empty content allowed

### RUN Operation
**Required attributes**: None

**Optional attributes**:
- `dir`: Any string value

**Content rules**:
- Content cannot be empty
- Must contain at least one non-whitespace character

### SEARCH Operation
**Required attributes**:
- `file`: Must be present (can be empty string)

**Optional attributes**:
- `count`: Must be positive integer or "all"

**Content rules**:
- `pattern` cannot be empty
- `to` (if present) cannot be empty
- `replacement` can be empty (indicates deletion)

### TASKS Operation
**Required attributes**: None

**Optional attributes**:
- `version`: Any string value

**Content rules**:
- Must contain at least one operation
- Cannot contain nested TASKS

## Validation Error Format

```typescript
interface ValidationError {
  line: number;        // Line number from operation
  operation: string;   // Operation type (WRITE, RUN, etc)
  error: string;       // Human-readable error message
  field?: string;      // Affected field name if applicable
}
```

## Error Messages

Standardized error messages for consistency:

- Missing required attribute: `"Missing required attribute 'file'"`
- Invalid attribute value: `"Invalid value for 'count': must be positive integer or 'all'"`
- Empty content: `"Empty content not allowed for RUN operation"`
- Empty pattern: `"Empty search pattern not allowed"`
- Nested TASKS: `"TASKS cannot contain other TASKS operations"`