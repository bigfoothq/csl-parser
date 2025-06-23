20250123

# CSL Validation Rules

The validator enforces semantic rules after parsing. See CSL Requirements (csl_reqs.md) for the complete specification.

## Validation Process
- Collects all errors in single pass
- No AST transformation
- Returns array of errors (see API.md for format)

## Error Messages
Validator must output these exact messages:
- `"Missing required attribute 'file'"`
- `"Invalid value for 'count': must be positive integer or 'all'"` 
- `"Invalid value for 'append': must be 'true' or 'false'"`
- `"Empty content not allowed for RUN operation"`
- `"Empty search pattern not allowed"`
- `"Empty TO pattern not allowed"`
- `"TASKS cannot contain other TASKS operations"`
