20250123

# CSL (Clada Syntax Language) Specification

## Syntax

### Markers
- Start delimiter: `<---` (default, configurable via parser options)
- End delimiter: `--->` (default, configurable via parser options)
- Format: `<---OPERATION attributes--->`
- Must start at beginning of line
- Operation names are case-sensitive (WRITE, RUN, SEARCH, TASKS must be uppercase)
- Attribute names are case-sensitive
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
- Attribute names follow XML naming rules: can contain letters, digits, hyphens, underscores, colons, and periods. Cannot contain spaces, quotes, equals, or angle brackets
- At least one whitespace character required between operation name and first attribute
- Whitespace required between attributes (multiple spaces normalized to single)
- Whitespace allowed around `=` (e.g., `attr = "value"` valid)
- Values must be quoted (unquoted values like `attr=value` are parse errors)
- Empty values allowed: `attr=""`
- Attributes must be on same line as operation marker
- END markers cannot have attributes (`<---END--->` is the only valid form)
- Escape sequences within values:
  - `\"` → `"` (inside double quotes)
  - `\'` → `'` (inside single quotes)  
  - `\\` → `\`
  - Other backslash sequences (e.g., `\n`, `\t`) are literal text

### Content Blocks
- All text between operation markers and END
- Preserved exactly (including whitespace and line endings)
- May contain CSL syntax as literal text

## Syntax Rules (Parser Enforced)

### Structural Rules
- Every operation must end with `<---END--->`
- TASKS cannot be nested (maximum depth: 1)
- No content allowed on same line as markers
- Lines starting with `<---` must form valid markers or cause parse error
- All markers must appear on their own lines
- Duplicate attributes not allowed in same operation

### Marker Formation
- Valid operation names: WRITE, RUN, SEARCH, TASKS
- Valid state transition markers per context
- Proper delimiter syntax

## Semantic Rules (Validator Enforced)

### Required Attributes
- WRITE: `file` (required), `append` (optional)
- SEARCH: `file` (required), `count` (optional)
- RUN: `dir` (optional)
- TASKS: `version` (optional)

### Attribute Values
- `count`: positive integer or "all"
- `append`: "true" or "false"
- `file`, `dir`, `version`: any string

### Content Rules
- Empty content = zero bytes between markers
- Empty WRITE content: valid
- Empty RUN content: invalid
- Empty SEARCH pattern: invalid
- Empty TO pattern: invalid
- Empty REPLACE content: valid (deletion)

### Content Handling
- Content starts on the line after an operation marker
- Content ends on the line before the END marker
- All line endings normalized to LF (\n) during parsing (following Git's approach)
- Mixed line endings within a file are normalized consistently
- Platform-specific line endings applied only during file write operations (execution phase)
- Parser handles CRLF, LF, and CR inputs, all normalized to LF

### Search Operation Rules
- TO marker only valid in SEARCH operations
- If TO present, defines range replacement
- If TO absent, defines single/multiple replacement
- REPLACE marker required in all SEARCH operations
- Replacement count defaults to 1 if not specified
- Count must be positive integer or "all"

### State Transitions

Valid state transitions enforced by parser:

| Current State | Valid Next Markers | Notes |
|--------------|-------------------|-------|
| (none) | WRITE, RUN, SEARCH, TASKS | Initial state |
| WRITE | END | No other operations allowed |
| RUN | END | No other operations allowed |
| SEARCH (pattern) | TO, REPLACE | After initial SEARCH marker |
| SEARCH (to) | REPLACE | After TO marker |
| SEARCH (replace) | END | After REPLACE marker |
| TASKS | WRITE, RUN, SEARCH, END | Can contain multiple operations |

Inside TASKS:
- When operation completes (END), state returns to TASKS
- TASKS cannot be nested (parser throws error)
- When TASKS ends, state returns to (none)

## Component Responsibilities

### Parser Enforces
- Marker formation and syntax
- State transitions (valid operations in current context)
- Structural rules (proper nesting, END markers)
- Attribute syntax (quotes, duplicates)
- Lines starting with `<---` must form valid markers

### Validator Enforces
- Required attributes presence
- Attribute value constraints (e.g., count must be positive integer or "all")
- Content rules (empty content restrictions)
- Semantic correctness

## Error Conditions

### Parse Errors (thrown immediately)
- Unclosed operations (missing END)
- Invalid operation names
- Malformed markers (missing delimiters, spaces in markers, incomplete markers)
- Invalid marker for current context (e.g., TO outside SEARCH)
- Duplicate attributes

### Validation Errors (collected and returned)
- Missing required attributes
- Invalid attribute values
- Empty search patterns
- Empty RUN content
- Empty TO patterns
- Nested TASKS blocks
- Note: Empty TASKS (no operations) is valid

### Error Reporting
- Line numbers in all errors are 1-indexed
- Parser throws on first error
- Validator returns all errors found

## Execution Considerations (Not Parser Responsibility)
- Platform-specific line endings applied during file operations
- SEARCH operations normalize both file and pattern for matching
- Binary file detection prevents unwanted normalization

## Edge Cases
- All markers (`<---OPERATION...>`, `<---TO--->`, `<---REPLACE--->`, `<---END--->`) must be complete lines with no other content
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
- SEARCH to content: only `<---REPLACE--->`
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

**Answer**: END markers cannot have attributes. `<---END--->` is the only valid form. Parser throws on `<---END attr="value"--->`.

## 2. Parser vs Validator Responsibility
**Concern**: Requirements mix syntax and semantic rules without clear ownership.
**Why it matters**: Parser and validator need clear boundaries for implementation.
**Question**: Which component enforces which rules?

**Answer**: Parser enforces syntax (marker formation, state transitions). Validator enforces semantics (required attributes, value constraints).

## Execution Considerations (Not Parser Responsibility)
- Platform-specific line endings applied during file operations
- SEARCH operations normalize both file and pattern for matching
- Binary file detection prevents unwanted normalization