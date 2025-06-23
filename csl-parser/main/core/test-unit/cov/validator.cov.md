20250123

# CSL Validator Covenant

validate(ast) → ValidationError[]

## Test Implementation Notes

- Validator returns array of ALL errors found (empty array if valid)
- Error format: `{line: number, operation: string, error: string, field?: string}`
- Line numbers come from AST operation objects
- Tests should verify exact error messages from validation_rules.md

## required_fields

### write_operations

#### WRITE missing file attribute

- validate([{type: 'WRITE', line: 1, content: 'hello'}])
→ [{line: 1, operation: 'WRITE', error: "Missing required attribute 'file'"}]

- validate([{type: 'WRITE', line: 5, append: 'true', content: 'data'}])
→ [{line: 5, operation: 'WRITE', error: "Missing required attribute 'file'"}]

### search_operations

#### SEARCH missing file attribute

- validate([{type: 'SEARCH', line: 3, pattern: 'old', replacement: 'new'}])
→ [{line: 3, operation: 'SEARCH', error: "Missing required attribute 'file'"}]

- validate([{type: 'SEARCH', line: 10, count: '2', pattern: 'find', to: 'end', replacement: 'replace'}])
→ [{line: 10, operation: 'SEARCH', error: "Missing required attribute 'file'"}]

### valid_operations

#### Operations with all required fields

- validate([{type: 'WRITE', line: 1, file: 'test.txt', content: 'hello'}])
→ []

- validate([{type: 'RUN', line: 2, content: 'echo test'}])
→ []

- validate([{type: 'SEARCH', line: 3, file: 'app.js', pattern: 'old', replacement: 'new'}])
→ []

- validate([{type: 'TASKS', line: 4, operations: []}])
→ []

## attribute_validation

### count_values

#### Invalid count attribute values

- validate([{type: 'SEARCH', line: 1, file: 'test.js', count: '0', pattern: 'x', replacement: 'y'}])
→ [{line: 1, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count'}]

- validate([{type: 'SEARCH', line: 2, file: 'test.js', count: '-5', pattern: 'x', replacement: 'y'}])
→ [{line: 2, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count'}]

- validate([{type: 'SEARCH', line: 3, file: 'test.js', count: 'invalid', pattern: 'x', replacement: 'y'}])
→ [{line: 3, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count'}]

- validate([{type: 'SEARCH', line: 4, file: 'test.js', count: '3.14', pattern: 'x', replacement: 'y'}])
→ [{line: 4, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count'}]

#### Valid count values

- validate([{type: 'SEARCH', line: 1, file: 'test.js', count: '1', pattern: 'x', replacement: 'y'}])
→ []

- validate([{type: 'SEARCH', line: 2, file: 'test.js', count: '999', pattern: 'x', replacement: 'y'}])
→ []

- validate([{type: 'SEARCH', line: 3, file: 'test.js', count: 'all', pattern: 'x', replacement: 'y'}])
→ []

### append_values

#### Invalid append attribute values

- validate([{type: 'WRITE', line: 1, file: 'log.txt', append: 'yes', content: 'data'}])
→ [{line: 1, operation: 'WRITE', error: "Invalid value for 'append': must be 'true' or 'false'", field: 'append'}]

- validate([{type: 'WRITE', line: 2, file: 'log.txt', append: 'TRUE', content: 'data'}])
→ [{line: 2, operation: 'WRITE', error: "Invalid value for 'append': must be 'true' or 'false'", field: 'append'}]

- validate([{type: 'WRITE', line: 3, file: 'log.txt', append: '1', content: 'data'}])
→ [{line: 3, operation: 'WRITE', error: "Invalid value for 'append': must be 'true' or 'false'", field: 'append'}]

#### Valid append values

- validate([{type: 'WRITE', line: 1, file: 'log.txt', append: 'true', content: 'data'}])
→ []

- validate([{type: 'WRITE', line: 2, file: 'log.txt', append: 'false', content: 'data'}])
→ []

### unknown_attributes

#### Unknown attributes are ignored

- validate([{type: 'WRITE', line: 1, file: 'test.txt', unknown: 'value', custom: '123', content: 'data'}])
→ []

- validate([{type: 'RUN', line: 2, extra: 'ignored', content: 'echo test'}])
→ []

## content_validation

### run_empty_content

#### Empty RUN content not allowed

- validate([{type: 'RUN', line: 1, content: ''}])
→ [{line: 1, operation: 'RUN', error: "Empty content not allowed for RUN operation"}]

- validate([{type: 'RUN', line: 5, dir: '/tmp', content: ''}])
→ [{line: 5, operation: 'RUN', error: "Empty content not allowed for RUN operation"}]

#### Valid RUN content

- validate([{type: 'RUN', line: 1, content: 'echo test'}])
→ []

- validate([{type: 'RUN', line: 2, content: ' '}])
→ []

### search_patterns

#### Empty search patterns not allowed

- validate([{type: 'SEARCH', line: 1, file: 'test.js', pattern: '', replacement: 'new'}])
→ [{line: 1, operation: 'SEARCH', error: "Empty search pattern not allowed"}]

- validate([{type: 'SEARCH', line: 3, file: 'app.py', pattern: '', to: 'end', replacement: 'code'}])
→ [{line: 3, operation: 'SEARCH', error: "Empty search pattern not allowed"}]

#### Empty TO patterns not allowed

- validate([{type: 'SEARCH', line: 2, file: 'main.c', pattern: 'start', to: '', replacement: 'new'}])
→ [{line: 2, operation: 'SEARCH', error: "Empty TO pattern not allowed"}]

#### Valid search patterns

- validate([{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'find', replacement: 'replace'}])
→ []

- validate([{type: 'SEARCH', line: 2, file: 'test.js', pattern: ' ', replacement: 'space'}])
→ []

### valid_empty_content

#### Empty WRITE content is valid

- validate([{type: 'WRITE', line: 1, file: 'empty.txt', content: ''}])
→ []

#### Empty REPLACE content is valid (deletion)

- validate([{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'remove', replacement: ''}])
→ []

- validate([{type: 'SEARCH', line: 2, file: 'clean.py', pattern: 'start', to: 'end', replacement: ''}])
→ []

## nested_validation

### tasks_in_tasks

#### Direct TASKS nesting

- validate([{type: 'TASKS', line: 1, operations: [
    {type: 'TASKS', line: 2, operations: []}
  ]}])
→ [{line: 2, operation: 'TASKS', error: "TASKS cannot contain other TASKS operations"}]

- validate([{type: 'TASKS', line: 5, version: '1.0', operations: [
    {type: 'WRITE', line: 6, file: 'test.txt', content: 'hello'},
    {type: 'TASKS', line: 7, operations: []},
    {type: 'RUN', line: 8, content: 'echo done'}
  ]}])
→ [{line: 7, operation: 'TASKS', error: "TASKS cannot contain other TASKS operations"}]

### deep_nesting

#### Deeply nested TASKS detection

- validate([{type: 'TASKS', line: 1, operations: [
    {type: 'WRITE', line: 2, file: 'a.txt', content: 'a'},
    {type: 'TASKS', line: 3, operations: [
      {type: 'TASKS', line: 4, operations: []}
    ]}
  ]}])
→ [
  {line: 3, operation: 'TASKS', error: "TASKS cannot contain other TASKS operations"},
  {line: 4, operation: 'TASKS', error: "TASKS cannot contain other TASKS operations"}
]

#### Valid TASKS without nesting

- validate([{type: 'TASKS', line: 1, operations: [
    {type: 'WRITE', line: 2, file: 'test.txt', content: 'data'},
    {type: 'RUN', line: 3, content: 'npm test'},
    {type: 'SEARCH', line: 4, file: 'app.js', pattern: 'old', replacement: 'new'}
  ]}])
→ []

## edge_cases

### multiple_errors

#### Multiple errors on same operation

- validate([{type: 'WRITE', line: 1, append: 'invalid', content: 'data'}])
→ [
  {line: 1, operation: 'WRITE', error: "Missing required attribute 'file'"},
  {line: 1, operation: 'WRITE', error: "Invalid value for 'append': must be 'true' or 'false'", field: 'append'}
]

- validate([{type: 'SEARCH', line: 5, count: 'bad', pattern: '', replacement: 'new'}])
→ [
  {line: 5, operation: 'SEARCH', error: "Missing required attribute 'file'"},
  {line: 5, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count'},
  {line: 5, operation: 'SEARCH', error: "Empty search pattern not allowed"}
]

#### Multiple operations with errors

- validate([
    {type: 'WRITE', line: 1, content: 'test'},
    {type: 'RUN', line: 2, content: ''},
    {type: 'SEARCH', line: 3, file: 'app.js', pattern: '', replacement: 'x'}
  ])
→ [
  {line: 1, operation: 'WRITE', error: "Missing required attribute 'file'"},
  {line: 2, operation: 'RUN', error: "Empty content not allowed for RUN operation"},
  {line: 3, operation: 'SEARCH', error: "Empty search pattern not allowed"}
]

### malformed_ast

#### Missing required AST fields

- validate([{type: 'WRITE', line: 1, file: 'test.txt'}])
→ []  // content field missing but validator handles gracefully

- validate([{type: 'SEARCH', line: 2, file: 'app.js', pattern: 'find'}])
→ []  // replacement field missing but validator handles gracefully

- validate([{type: 'TASKS', line: 3}])
→ []  // operations field missing but validator handles gracefully

### empty_ast

#### Empty AST is valid

- validate([])
→ []

### complex_scenarios

#### Nested TASKS with multiple errors

- validate([{type: 'TASKS', line: 1, operations: [
    {type: 'WRITE', line: 2, append: 'wrong', content: ''},
    {type: 'RUN', line: 3, content: ''},
    {type: 'SEARCH', line: 4, count: '-1', pattern: '', to: '', replacement: ''},
    {type: 'TASKS', line: 5, operations: []}
  ]}])
→ [
  {line: 2, operation: 'WRITE', error: "Missing required attribute 'file'"},
  {line: 2, operation: 'WRITE', error: "Invalid value for 'append': must be 'true' or 'false'", field: 'append'},
  {line: 3, operation: 'RUN', error: "Empty content not allowed for RUN operation"},
  {line: 4, operation: 'SEARCH', error: "Missing required attribute 'file'"},
  {line: 4, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count'},
  {line: 4, operation: 'SEARCH', error: "Empty search pattern not allowed"},
  {line: 4, operation: 'SEARCH', error: "Empty TO pattern not allowed"},
  {line: 5, operation: 'TASKS', error: "TASKS cannot contain other TASKS operations"}
]