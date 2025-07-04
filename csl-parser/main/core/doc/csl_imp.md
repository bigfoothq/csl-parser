20250123

# CSL Parser Implementation Guide

## Architecture Overview

### Module Boundaries
- **Attribute Parser**: Extracts key-value pairs from attribute strings
- **Marker Detector**: Identifies and validates line-starting markers
- **State Machine**: Manages parse state and valid transitions
- **Content Accumulator**: Collects content between markers
- **AST Builder**: Constructs operation objects
- **Error Reporter**: Formats and throws parse errors

## Parsing Strategy

### Two-Phase Line Processing
1. **Marker Detection Phase**
   - Lines starting with `<---` must form valid marker or throw error
   - Regex pattern: `/^<---(\w+)(\s+(.*))?--->$/`
   - Extract operation name (must match `\w+`)
   - Extract attribute string
   - Validate marker syntax completeness
   - Pass to attribute parser if valid

2. **Content Collection Phase**
   - Non-marker lines append to active content buffer
   - All line endings normalized to LF (\n) during parsing
   - Marker lines validated against current state
   - Invalid state transitions throw immediately
   - Entire line must match marker pattern - no leading/trailing content
   - Partial line matches are parse errors, not content

### State Management
- Single state variable with compound values:
  - `null` (no active operation)
  - `'WRITE'`
  - `'RUN'`
  - `'SEARCH_PATTERN'`
  - `'SEARCH_TO'`
  - `'SEARCH_REPLACEMENT'`
  - `'TASKS'`
- Boolean `insideTasks` tracks if currently inside TASKS block
- No stack needed since TASKS cannot nest
- Content buffers per operation type:
  - Single buffer: WRITE, RUN
  - Triple buffer: SEARCH (pattern, to, replacement)

### Error Detection Points

**Parse Phase Errors** (parser throws immediately):
- **Lexical Errors**:
  - Malformed markers: missing delimiters, incomplete markers
  - Unterminated quoted attributes
  - Unknown operation names: Any `<---XXX--->` where XXX is not WRITE/RUN/SEARCH/TASKS/END/TO/REPLACE
- **Syntactic Errors**:
  - Invalid marker for current state
  - Nested TASKS blocks
  - Missing END markers

**Validation Phase Errors** (validator reports after parsing):
- **Semantic Errors**:
  - Missing required attributes
  - Invalid attribute values
  - Empty content violations:
    - SEARCH pattern cannot be empty
    - TO pattern cannot be empty
    - RUN content cannot be empty

## Error Handling Strategy

### Error Handling Strategy
- Parser: Throws immediately on first error (fail-fast)
- Validator: Collects all errors in single pass
- See API.md for error formats

## Implementation Flow

### Main Parse Loop
1. Initialize state to null, insideTasks to false
2. Initialize line counter to 1
3. Process each line sequentially, increment counter after each
4. For `<---` lines: attempt marker parse
5. For successful markers: validate state transition
6. For content lines: append to current buffer
7. On END markers: complete current operation, update state
8. Return complete AST or throw error

### Attribute Parsing Algorithm
1. Parse character-by-character with quote state tracking
2. For each token: extract key=value pattern using `/(\S+)\s*=\s*("[^"]*"|'[^']*')/`
3. Handle quoted values with escape processing
4. Escape sequences processed left-to-right, single pass
5. Any non-whitespace allowed in attribute names
6. Check if key exists in map before insertion
7. Throw if duplicate found
8. Add key-value to map
9. Return map or throw on syntax error
10. No validation of attribute values (e.g., count="invalid" accepted)

### State Transition Validation

Valid transitions by current state:
- `null`: Can start WRITE, RUN, SEARCH, or TASKS
- `WRITE`: Only END valid
- `RUN`: Only END valid
- `SEARCH_PATTERN`: TO or REPLACE valid
- `SEARCH_TO`: Only REPLACE valid
- `SEARCH_REPLACEMENT`: Only END valid
- `TASKS`: WRITE, RUN, SEARCH, or END valid

When TASKS marker encountered:
- If `insideTasks` true: throw error (nested TASKS)
- Otherwise: set state to TASKS, set insideTasks to true

When END marker encountered:
- If `insideTasks` true and state is not TASKS: set state to TASKS
- Otherwise: set state to null and insideTasks to false

Invalid transitions throw immediately with line number.

Example error messages:
- `"Line 5: Unknown operation: INVALID"`
- `"Line 3: WRITE marker not valid in RUN operation"`
- `"Line 7: TASKS cannot be nested"`

## Content Handling
- Join content lines with LF (\n)
- No whitespace trimming
- Empty content = zero bytes between markers
- Trailing newline included if blank line before END marker

## AST Construction
- Build operation objects incrementally
- Attach line numbers for error context
- Type remains as string (no coercion)
- Flatten all attributes to top level of operation object
- Preserve unknown attributes as-is
- Return array of operation objects per TYPES.md schema
- No validation of required fields (validator responsibility)

<<<END>>>

<<<FILE>>>
csl-parser/main/core/doc/csl_imp.md
<<<SEARCH>>>
## Whitespace Normalization Between Attributes
**Concern**: Implementation doesn't specify whether `attr1="x"    attr2="y"` preserves multiple spaces or normalizes to single space.  
**Why it matters**: Affects parser complexity and attribute string reconstruction.  
**Question**: Should parser preserve exact whitespace between attributes or normalize to single spaces?

ANSWER - normalize to single space or do whatever so that  it's ok to have multiple spaces bewteen attributes
<<<REPLACE>>>

<<<END>>>

<<<FILE>>>
csl-parser/main/core/doc/csl_imp.md
<<<SEARCH>>>
Invalid transitions throw immediately with line number.

Example error messages:
- `"Line 5: Unknown operation: INVALID"`
- `"Line 3: WRITE marker not valid in RUN operation"`
- `"Line 7: TASKS cannot be nested"`
<<<REPLACE>>>
Invalid transitions throw immediately with line number (e.g., `"Line 5: Unknown operation: INVALID"`).

# CSL Implementation Q&A

## Marker Regex Pattern
**Q**: Pattern `/^<---(\w+)(\s+(.*))?--->$/` allows spaces before operation. does that Contradict spec?

**A**: its fine if theres a space between the marker and the operation name


## Line Number Tracking
**Q**: How track line numbers during parsing for 1-indexed errors?

**A**: Initialize counter to 1. Increment after processing each line. Store with each operation.

## TO Marker State
**Q**: How track if TO seen to validate REPLACE requirement?

**A**: Use compound states: SEARCH_PATTERN → SEARCH_TO → SEARCH_REPLACEMENT. Transition through states enforces order.

## Duplicate Attribute Detection
**Q**: Map silently overwrites duplicates instead of detecting.

**A**: Check map.has(key) before insertion. Throw if exists.

## END Marker Context
**Q**: How validate END matches current operation context?

**A**: State machine handles this. Invalid END in wrong state throws error.


<<<END>>>

<<<FILE>>>
csl-parser/main/core/doc/csl_imp.md
<<<SEARCH>>>
**Parse Phase Errors** (parser throws immediately):
- **Lexical Errors**:
  - Malformed markers: missing delimiters, incomplete markers
  - Unterminated quoted attributes
  - Unknown operation names: Any `<---XXX--->` where XXX is not WRITE/RUN/SEARCH/TASKS/END/TO/REPLACE
<<<REPLACE>>>
**Parse Phase Errors** (parser throws immediately):
- **Lexical Errors**:
  - Malformed markers: missing delimiters, incomplete markers
  - Unterminated quoted attributes
  - Unknown operation names: Any `<---XXX--->` where XXX is not WRITE/RUN/SEARCH/TASKS/END/TO/REPLACE

## Whitespace Normalization Between Attributes
**Concern**: Implementation doesn't specify whether `attr1="x"    attr2="y"` preserves multiple spaces or normalizes to single space.  
**Why it matters**: Affects parser complexity and attribute string reconstruction.  
**Question**: Should parser preserve exact whitespace between attributes or normalize to single spaces?

ANSWER - normalize to single space or do whatever so that  it's ok to have multiple spaces bewteen attributes

## Missing Required Attributes
**Q**: When are missing required attributes detected?
**A**: During validation phase, not parsing. Parser produces AST with whatever attributes present.

## Invalid Attribute Values
**Q**: Does parser validate that count="all" or count="3"? What about count="invalid"?
**A**: Parser extracts attribute as-is. Validator checks if count is positive integer or "all".

## Invalid Operation Transitions
**Q**: What if `<---WRITE--->` appears while in RUN state?
**A**: Parser throws error. Must have END marker before starting new operation.