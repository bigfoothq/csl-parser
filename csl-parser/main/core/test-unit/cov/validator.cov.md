20250123

# validator.cov.md

validate(ast) → ValidationError[]

## Valid Operations

validate([{type: 'WRITE', file: 'test.txt', content: 'hello', line: 1}]) 
→ []

validate([{type: 'RUN', content: 'echo test', line: 1}]) 
→ []

validate([{type: 'SEARCH', file: 'test.js', pattern: 'old', replacement: 'new', line: 1}]) 
→ []

validate([{type: 'TASKS', operations: [], line: 1}]) 
→ []

## Missing Required Attributes

validate([{type: 'WRITE', content: 'hello', line: 1}]) 
→ [{line: 1, operation: 'WRITE', error: "Missing required attribute 'file'"}]

validate([{type: 'SEARCH', pattern: 'old', replacement: 'new', line: 1}]) 
→ [{line: 1, operation: 'SEARCH', error: "Missing required attribute 'file'"}]

## Invalid Attribute Values

validate([{type: 'WRITE', file: 'test.txt', append: 'yes', content: 'hello', line: 1}]) 
→ [{line: 1, operation: 'WRITE', error: "Invalid value for 'append': must be 'true' or 'false'", field: 'append'}]

validate([{type: 'SEARCH', file: 'test.js', count: 'invalid', pattern: 'old', replacement: 'new', line: 1}]) 
→ [{line: 1, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count'}]

## Empty Content Violations

validate([{type: 'RUN', content: '', line: 1}]) 
→ [{line: 1, operation: 'RUN', error: "Empty content not allowed for RUN operation"}]

validate([{type: 'SEARCH', file: 'test.js', pattern: '', replacement: 'new', line: 1}]) 
→ [{line: 1, operation: 'SEARCH', error: "Empty search pattern not allowed"}]

validate([{type: 'SEARCH', file: 'test.js', pattern: 'old', to: '', replacement: 'new', line: 1}]) 
→ [{line: 1, operation: 'SEARCH', error: "Empty TO pattern not allowed"}]

## Multiple Errors

validate([
  {type: 'WRITE', content: 'hello', line: 1},
  {type: 'RUN', content: '', line: 4},
  {type: 'SEARCH', pattern: 'old', replacement: 'new', line: 7}
]) 
→ [
  {line: 1, operation: 'WRITE', error: "Missing required attribute 'file'"},
  {line: 4, operation: 'RUN', error: "Empty content not allowed for RUN operation"},
  {line: 7, operation: 'SEARCH', error: "Missing required attribute 'file'"}
]

## Nested TASKS Validation

validate([{
  type: 'TASKS', 
  operations: [
    {type: 'WRITE', file: 'test.txt', content: 'hello', line: 2},
    {type: 'TASKS', operations: [], line: 3}
  ], 
  line: 1
}]) 
→ [{line: 3, operation: 'TASKS', error: "TASKS cannot contain other TASKS operations"}]

## Valid Edge Cases

validate([{type: 'WRITE', file: '', content: 'hello', line: 1}]) 
→ []

validate([{type: 'SEARCH', file: 'test.js', pattern: 'old', replacement: '', line: 1}]) 
→ []

validate([{type: 'RUN', dir: '/path/to/dir', content: 'ls', line: 1}]) 
→ []