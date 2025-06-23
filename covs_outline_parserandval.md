https://claude.ai/chat/1c1b1c89-5c27-42a9-806c-7de338331fba

# CSL Parser Covenant Design Decisions

## Covenant Format

### Input/Output Notation
```
functionName(params) → ReturnType

- functionName('multiline
input
string') 
→ {expected: 'output', format: 'here'}

- functionName('single line input') → Error("Exact error message")
```

### Key Format Rules
- Use multiline strings with quotes to show CSL input clearly
- Preserve exact whitespace and newlines in examples
- Show trailing newlines explicitly (e.g., `content: 'text\n'`)
- Error examples must show exact error messages from docs

## Parser Covenant Structure

### Test Group Hierarchy

```
parser/
├── operations/
│   ├── write/
│   │   ├── basic              # Simple WRITE operations
│   │   ├── append             # WRITE with append attribute
│   │   └── multiple_attrs     # WRITE with multiple attributes
│   ├── run/
│   │   ├── basic              # Simple RUN operations
│   │   └── dir                # RUN with dir attribute
│   ├── search/
│   │   ├── simple             # Pattern → replace
│   │   ├── range              # Pattern → to → replace
│   │   └── count              # SEARCH with count attribute
│   └── tasks/
│       ├── empty              # Empty TASKS block
│       ├── single_op          # TASKS with one operation
│       └── multiple_ops       # TASKS with multiple operations
├── attributes/
│   ├── syntax/
│   │   ├── double_quotes      # attr="value"
│   │   ├── single_quotes      # attr='value'
│   │   ├── empty_values       # attr=""
│   │   └── whitespace         # attr = "value" variations
│   ├── escaping/
│   │   ├── double_quotes      # \" inside double quotes
│   │   ├── single_quotes      # \' inside single quotes
│   │   └── literal_backslash  # \\ sequences
│   └── errors/
│       ├── duplicates         # Duplicate attribute detection
│       ├── unterminated       # Unterminated quotes
│       └── unquoted           # attr=value (no quotes)
├── content/
│   ├── basic/
│   │   ├── empty              # Zero bytes between markers
│   │   ├── single_line        # One line of content
│   │   └── multi_line         # Multiple lines
│   ├── special/
│   │   ├── csl_like           # Content containing <--- markers
│   │   ├── trailing_newlines  # Blank lines before END
│   │   └── line_endings       # CRLF/LF/CR normalization
│   └── large/
│       ├── long_lines         # Very long single lines
│       ├── many_lines         # Many lines of content
│       └── unicode            # Unicode characters
├── state_machine/
│   ├── valid/
│   │   ├── sequences          # Valid operation orders
│   │   ├── search_flow        # SEARCH → TO → REPLACE → END
│   │   └── tasks_context      # State changes in TASKS
│   └── invalid/
│       ├── wrong_marker       # Invalid marker for state
│       ├── missing_end        # Unterminated operations
│       └── nested_tasks       # TASKS inside TASKS
└── parse_errors/
    ├── malformed/
    │   ├── incomplete         # <-- or ---> alone
    │   ├── spaces             # Spaces in markers
    │   └── unknown_ops        # <---INVALID--->
    └── structural/
        ├── unterminated       # Missing END
        └── content_on_marker  # <---END---> extra text
```

## Validator Covenant Structure

### Test Group Hierarchy

```
validator/
├── required_attrs/
│   ├── write/
│   │   ├── missing_file       # WRITE without file attribute
│   │   └── has_file           # Valid WRITE with file
│   └── search/
│       ├── missing_file       # SEARCH without file attribute
│       └── has_file           # Valid SEARCH with file
├── attribute_values/
│   ├── count/
│   │   ├── valid_integers     # count="1", count="42"
│   │   ├── all_value          # count="all"
│   │   └── invalid            # count="invalid", count="-1"
│   └── append/
│       ├── true_value         # append="true"
│       ├── false_value        # append="false"
│       └── invalid            # append="yes", append="1"
├── content_validation/
│   ├── valid_empty/
│   │   ├── write              # Empty WRITE content allowed
│   │   └── replace            # Empty REPLACE content allowed
│   └── invalid_empty/
│       ├── run                # Empty RUN content forbidden
│       ├── search_pattern     # Empty SEARCH pattern forbidden
│       └── to_pattern         # Empty TO pattern forbidden
└── tasks_rules/
    ├── valid/
    │   ├── empty              # Empty TASKS allowed
    │   └── with_operations    # TASKS containing operations
    └── invalid/
        └── nested             # TASKS inside TASKS forbidden
```

## Key Implementation Decisions

### Line Number Tracking
- Use 1-indexed line numbers (industry standard)
- Line number refers to where operation starts
- Track line numbers for all operations in AST

### Whitespace Handling
- Multiple spaces between attributes are normalized/accepted
- No whitespace trimming on content
- All line endings normalized to LF during parsing

### Error Handling
- Parser throws immediately on first error (fail-fast)
- Validator collects ALL errors in single pass
- Error messages must match exact strings from docs

### Content Preservation
- Empty content = zero bytes between markers
- Trailing newlines explicitly preserved
- CSL-like syntax in content treated as literal text

## Example Covenant Entries

### Parser Example
```
parse(text, options?) → Operation[]

# operations.write.basic
- parse('<---WRITE file="test.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]

- parse('<---WRITE file="test.txt"--->
content

<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n'}]

# parse_errors.malformed.unknown_ops
- parse('<---INVALID--->') 
→ Error("Line 1: Unknown operation: INVALID")
```

### Validator Example
```
validate(ast) → ValidationError[]

# required_attrs.write.missing_file
- validate([{type: 'WRITE', line: 1, content: 'text'}]) 
→ [{line: 1, operation: 'WRITE', error: "Missing required attribute 'file'"}]

# attribute_values.count.invalid
- validate([{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'foo', replacement: 'bar', count: 'invalid'}]) 
→ [{line: 1, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count'}]
```

## Benefits of This Structure

1. **Granular Testing**: Run specific test groups during development
2. **Clear Organization**: Nested structure mirrors code organization
3. **Focused Debugging**: Target specific functionality areas
4. **Comprehensive Coverage**: All edge cases systematically organized
5. **Living Documentation**: Covenants serve as executable specifications