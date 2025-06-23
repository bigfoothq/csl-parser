# CSL (Clada Syntax Language) Parser Requirements

## Language Specification

### Core Syntax
- **Markers**: Configurable delimiters (default: `<---` and `--->`)
- **Line positioning**: All markers must start at beginning of line
- **Case sensitivity**: Markers and operation types are case-sensitive
- **No escape mechanism**: Content containing marker sequences will cause parse errors

### Supported Operations

#### WRITE Operation
```
<---WRITE file="simple.txt"--->
Hello world
<---END--->

<---WRITE file="data.csv" append="true"--->
row1,data1
row2,data2
<---END--->
```

#### RUN Operation
```
<---RUN--->
echo "one
   two 
three"
<---END--->

<---RUN dir="/tmp"--->
python script.py --verbose
<---END--->
```
- One command per RUN block
- Multi-line commands supported

#### SEARCH/REPLACE Operation

**Basic replacement:**
```
<---SEARCH file="config.json"--->
"debug": false
<---REPLACE--->
"debug": true
<---END--->
```

**Multiple replacements:**
```
<---SEARCH file="app.js" count="2"--->
const old = "value";
<---REPLACE--->
const new = "updated";
<---END--->
```

**Range replacement:**
```
<---SEARCH file="main.py" type="range" count="1"--->
def process_data(
<---TO--->
    return result
<---REPLACE--->
def process_data(data, options=None):
    if options is None:
        options = {}
    filtered = apply_filters(data, options)
    return filtered
<---END--->
```

#### TASKS Container
```
<---TASKS--->
<---WRITE file="src/index.js"--->
console.log("app");
<---END--->
<---RUN--->
npm install
<---END--->
<---END--->

<---TASKS version="1.1"--->
<---SEARCH file="package.json" count="1"--->
"version": "1.0.0"
<---REPLACE--->
"version": "1.1.0"
<---END--->
<---RUN--->
git commit -m "bump version"
<---END--->
<---END--->
```

### Attribute Syntax
- Format: `key="value"` or `key='value'`
- Whitespace allowed around `=` and between attributes
- Values must be quoted
- Empty values allowed: `file=""`
- Escape sequences: `\"` within double quotes, `\'` within single quotes
- Attributes must be on same line as operation marker

## Parser Requirements

### Input/Output
- **Input**: String containing CSL markup
- **Output**: List of operation objects or parse error
- **Encoding**: UTF-8 text
- **Line endings**: Preserve original format in content

### Error Handling
- Parse errors are fatal
- No error recovery - halt on first syntax error
- Return partial results up to error point
- Error format: `Line {n}:{col}: {message}`

### Constraints
- No nested TASKS blocks (parse error if attempted)
- Content blocks preserve exact whitespace
- No cross-line marker support
- Parser configuration (markers) immutable after instantiation
- Attributes cannot span multiple lines

### Operation-Specific Rules

**SEARCH/REPLACE**:
- `TO` section only valid when `type="range"`
- Default count is 1
- Content sections can be multi-line
- Sequential state: SEARCH → (TO) → REPLACE

**TASKS**:
- Can contain any operation except other TASKS
- Must end with `<---END--->`
- Version attribute optional

### Edge Cases
- Empty content blocks are valid
- Content containing partial markers (e.g., `<--`) is valid
- Unclosed operations at EOF are errors
- Unexpected END markers are errors

### Content Handling
- Content blocks are treated as opaque text
- Nested syntax markers within content are preserved as literal text
- Example: A WRITE block may contain CSL syntax as documentation:
  ```
  <---WRITE file="example.csl"--->
  <---RUN--->
  echo "This is just text content"
  <---END--->
  <---END--->
  ```
  The inner RUN block is not parsed as an operation but preserved as file content
- Parser only recognizes markers at line start when in appropriate state

## Design Constraints

### Implementation Environment
- Node.js/JavaScript
- No external parser libraries
- Full file in memory (no streaming requirement)
- Batch processing context

### Module Boundaries
- Separate attribute parser module
- Main parser should not know attribute syntax details
- Clear error propagation with context

### Not Specified
- Maximum file size
- Maximum nesting depth
- Unicode normalization requirements
- Performance requirements
- Memory usage limits

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

## Revised Understanding

**END TASKS**: Single `<---END--->` for all operations keeps parser simpler. TASKS just maintains operation stack depth.

**SEARCH content blocks**: Three distinct content sections:
1. Search start pattern (before TO/REPLACE)
2. Search end pattern (after TO, if range type)
3. Replacement content (after REPLACE)

**Attribute escaping**: Standard is backslash escapes next character. So:
- `\"` → `"`
- `\'` → `'`
- `\\` → `\`
- `\n` → `\n` (literal backslash-n, not newline)

**State recognition**: Within SEARCH operation, parser must recognize:
- `<---TO--->` (transitions to end pattern)
- `<---REPLACE--->` (transitions to replacement)
- `<---END--->` (completes operation)

All other lines are content for current section.

**Remaining ambiguity**: 
- If `type="range"` but no TO marker appears, is that an error or does REPLACE act as boundary?
- Can TO appear in non-range searches? Error or ignored?

**RUN indentation**: Presumably preserved as-is since RUN passes to shell.

Requirements doc is sufficient for implementation given these clarifications.