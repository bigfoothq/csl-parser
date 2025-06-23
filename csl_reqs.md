# CSL (Clada Syntax Language) Specification

## Syntax

### Markers
- Start delimiter: `<---` (configurable)
- End delimiter: `--->` (configurable)
- Format: `<---OPERATION attributes--->`
- Must start at beginning of line
- Case-sensitive
- No spaces allowed within operation name or delimiters

### Operations

#### WRITE
Writes content to a file.
```
<---WRITE file="path/to/file.txt"--->
content to write
<---END--->

<---WRITE file="data.csv" append="true"--->
additional content
<---END--->
```

#### RUN
Executes a shell command.
```
<---RUN--->
echo "hello"
<---END--->

<---RUN dir="/working/directory"--->
python script.py
<---END--->
```

#### SEARCH
Finds and replaces content in files.

Single replacement:
```
<---SEARCH file="config.json"--->
"debug": false
<---REPLACE--->
"debug": true
<---END--->
```

Multiple replacements:
```
<---SEARCH file="app.js" count="3"--->
oldValue
<---REPLACE--->
newValue
<---END--->
```

Range replacement:
```
<---SEARCH file="main.py"--->
def process_data(
<---TO--->
    return result
<---REPLACE--->
def process_data(data, options=None):
    if options is None:
        options = {}
    return process(data, options)
<---END--->
```

#### TASKS
Groups multiple operations.
```
<---TASKS--->
<---WRITE file="src/app.js"--->
console.log("hello");
<---END--->
<---RUN--->
npm install
<---END--->
<---END--->

<---TASKS version="2.0"--->
operations...
<---END--->
```

### Attributes
- Format: `key="value"` or `key='value'`
- Attribute names can contain any non-whitespace characters
- Whitespace required between attributes
- Whitespace allowed around `=`
- Values must be quoted
- Empty values allowed: `attr=""`
- Attributes must be on same line as operation marker
- Escape sequences within values:
  - `\"` → `"` (inside double quotes)
  - `\'` → `'` (inside single quotes)  
  - `\\` → `\`
  - Other backslash sequences (e.g., `\n`, `\t`) are literal text

### Content Blocks
- All text between operation markers and END
- Preserved exactly (including whitespace and line endings)
- May contain CSL syntax as literal text

## Validation Rules

### Required Attributes
- WRITE: `file` (required), `append` (optional)
- SEARCH: `file` (required), `count` (optional)
- RUN: `dir` (optional)
- TASKS: `version` (optional)

### Attribute Values
- `count`: positive integer or "all"
- `append`: "true" or "false"
- `file`, `dir`, `version`: any string

### Structural Rules
- Every operation must end with `<---END--->`
- TASKS cannot be nested (maximum depth: 1)
- TASKS can contain any operation except other TASKS
- Duplicate attributes not allowed
- No content allowed on same line as markers
- Lines starting with `<---` must form valid markers or cause parse error (when not in content collection)

### Content Rules
- Empty content = zero bytes between markers (no characters, not even whitespace)
- Empty WRITE content: valid
- Empty RUN content: invalid
- Empty SEARCH pattern: invalid
- Empty TO pattern: invalid
- Empty REPLACE content: valid (deletion)
- One command per RUN block (spanning multiple lines allowed)
- Shell handles line continuations

### Search Operation Rules
- TO marker only valid in SEARCH operations
- If TO present, defines range replacement
- If TO absent, defines single/multiple replacement
- REPLACE marker required in all SEARCH operations
- Replacement count defaults to 1 if not specified
- Count must be positive integer or "all"

## Error Conditions
- Unclosed operations (missing END)
- Invalid operation names
- Malformed markers (missing delimiters, spaces in markers, incomplete markers)
- Invalid marker for current context (e.g., TO outside SEARCH)
- Missing required attributes
- Duplicate attributes
- Invalid attribute values
- Empty search patterns
- Empty RUN content
- Nested TASKS blocks
- Line numbers in errors are 1-indexed

## Edge Cases
- Lines starting with `<---` inside content blocks are treated as literal text unless they form valid state-transition markers:
  - WRITE/RUN content: only `<---END--->`
  - SEARCH pattern content: `<---TO--->`, `<---REPLACE--->`, `<---END--->`
  - SEARCH to content: only `<---REPLACE--->`
  - SEARCH replace content: only `<---END--->`
- Partial markers (e.g., `<--` or `-->`) are valid content
- CSL syntax within content blocks is preserved as literal text
- Mixed line endings preserved exactly
- File paths may be empty strings but attribute must exist


# CSL Requirements Q&A

## State-Transition Markers
**Q**: Which markers are "state-transition markers"? Is `<---WRITE file="test"--->` inside a WRITE block literal or error?

**A**: State-transition markers depend on current operation:
- WRITE/RUN content: only `<---END--->`
- SEARCH pattern content: `<---TO--->`, `<---REPLACE--->`, `<---END--->`
- SEARCH end content: only `<---REPLACE--->`
- SEARCH replace content: only `<---END--->`

Any other marker (like `<---WRITE file="test"--->`) is literal text.

## Empty Content
**Q**: What defines "empty" content? Zero bytes? Zero lines? Only whitespace?

**A**: Empty = zero bytes between markers. No characters at all, not even whitespace.

## TASKS Nesting
**Q**: "TASKS cannot be nested (maximum depth: 1)" is contradictory. Which is it?

**A**: Maximum depth 1 means one level of TASKS. Cannot put TASKS inside TASKS.

## Multi-line Commands
**Q**: How to distinguish one multi-line command from multiple commands in RUN?

**A**: One command that spans multiple lines. Shell handles line continuations.

## Escape Sequences
**Q**: What happens with `\n`, `\t`, or `\x` where x is not `"`, `'`, or `\`?

**A**: Literal text. `\n` = `\n` (two characters), not newline.

## Attribute Names
**Q**: Could `===`, `123`, or `@#$` be valid attribute names?

**A**: Yes. Any non-whitespace characters valid.

## Unquoted Values
**Q**: Is `key=value` (no quotes) valid or error?

**A**: Error. All values must be quoted.

## Content on Marker Lines
**Q**: Is `<---END---> extra text` an error?

**A**: Yes. No content allowed on any marker line.


## 1. END Marker Attributes 
**Concern**: The spec never states whether `<---END--->` can have attributes like `<---END debug="true"--->`.  
**Why it matters**: The implementation regex pattern accepts attributes on ALL markers including END, but zero examples show END with attributes. Developers need explicit guidance.  
**Question**: Should END markers accept attributes or not?

ANSWER - END markers should not accept attributes
