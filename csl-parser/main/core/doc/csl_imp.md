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
   - Preserve exact bytes including mixed line endings (\r\n, \n, \r)
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

### Error Information
Parser errors:
- Format: `throw new Error('Line ' + lineNum + ': ' + message)`
- Line number (1-indexed)
- Error type classification
- Descriptive message
- No partial results returned
- Thrown immediately

Validator errors:
- Returned as array
- Each error includes line, operation, message
- All errors collected in single pass

### Fail-Fast vs Collect-All
- Parser: First error halts parsing immediately
- Validator: Collects all errors before returning
- Different strategies for different phases

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

When END marker encountered:
- If `insideTasks` true and state is not TASKS: set state to TASKS
- Otherwise: set state to null and insideTasks to false

Invalid transitions throw immediately with line number.

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

## Post-Parse Validation

### Validator Contract
- Input: AST from parser (may contain invalid operations)
- Output: Array of validation errors or empty array if valid
- No AST transformation - validator is read-only
- Collects ALL errors in single pass (not fail-fast)

### Validation Process
1. Iterate through all operations in AST
2. For each operation:
   - Check required attributes exist
   - Validate attribute value formats
   - Check content constraints
3. Collect errors with operation context and line numbers
4. Return all errors found

### Error Object Structure
```javascript
{
  line: number,        // Line number from AST
  operation: string,   // Operation type
  error: string,       // Error message
  field?: string       // Optional field name
}
```

## Export Signatures

```javascript
// parser.js
export function parse(text) {
  // Returns AST or throws Error
}

// validator.js  
export function validate(ast) {
  // Returns ValidationError[]
}
```

# CSL Implementation Q&A

## Marker Regex Pattern
**Q**: Pattern `/^<---(\w+)(\s+(.*))?--->$/` allows spaces before operation. Contradicts spec.

**A**: Correct. Pattern assumes no spaces. If spaces present, `\w+` won't match, parse fails.


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


## Escape Sequence Contradiction
**Concern**: Implementation lists "invalid escape sequences" as lexical errors, but spec says sequences like `\n` are literal text.  
**Why it matters**: These are opposite behaviors - error vs. literal text. Implementation must match spec.  
**Question**: Should implementation remove "invalid escape sequences" from error list to match spec?

ANSWER: Yes. Remove "invalid escape sequences" from lexical errors. Implementation must match spec - \n, \t etc. are literal text, not errors.

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