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
- Single state variable tracking current parse context
- Operation stack for TASKS nesting (max depth 1)
- Stack tracks return state (TOP_LEVEL or TASKS_LEVEL)
- TASKS can contain WRITE, RUN, SEARCH (not other TASKS)
- Content buffers per operation type:
  - Single buffer: WRITE, RUN
  - Triple buffer: SEARCH (pattern, to, replacement)

### Error Detection Points

**Lexical Errors** (detected during marker parsing):
- Malformed markers: missing delimiters, spaces in operation names
- Unterminated quoted attributes
- Invalid escape sequences
- Unknown operation names

**Syntactic Errors** (detected during state transitions):
- Invalid marker for current state
- Nested TASKS blocks
- Missing END markers
- Unexpected content outside operations

**Semantic Errors** (detected post-parse):
- Missing required attributes
- Invalid attribute values
- Empty content violations:
  - SEARCH pattern cannot be empty
  - TO pattern cannot be empty
  - RUN content cannot be empty

## Error Handling Strategy

### Error Information
All errors include:
- Line number (1-indexed)
- Error type classification
- Descriptive message
- No partial results returned

### Fail-Fast Approach
- First error halts parsing immediately
- No error recovery attempted
- Clean state ensures predictable behavior

## Implementation Flow

### Main Parse Loop
1. Initialize state machine to TOP_LEVEL
2. Initialize line counter to 1
3. Process each line sequentially, increment counter after each
4. For `<---` lines: attempt marker parse
5. For successful markers: validate state transition
6. For content lines: append to current buffer
7. On END markers: complete current operation
8. Return complete AST or throw error

### Attribute Parsing Algorithm
1. Parse character-by-character with quote state tracking
2. For each token: extract key=value pattern
3. Handle quoted values with escape processing
4. Escape sequences processed left-to-right, single pass
5. Any non-whitespace allowed in attribute names
6. Check if key exists in map before insertion
7. Throw if duplicate found
8. Add key-value to map
9. Return map or throw on syntax error

### State Transition Validation
- Maintain transition table for valid state changes
- Check marker type against current state
- Update state and initialize appropriate buffers
- Track TASKS depth for nesting validation

## Content Handling
- Join content lines with LF (\n)
- No whitespace trimming
- Empty content = zero bytes between markers
- Trailing newline included if blank line before END marker

## AST Construction
- Build operation objects incrementally
- Attach line numbers for error context
- Validate required fields before returning
- Type remains as string (no coercion)
- Flatten all attributes to top level of operation object
- Preserve unknown attributes as-is
- Return array of operation objects per TYPES.md schema

## Post-Parse Validation
- Separate pass over AST
- Check required attributes per operation type
- Validate attribute value constraints
- Report first violation found

# CSL Implementation Q&A

## Marker Regex Pattern
**Q**: Pattern `/^<---(\w+)(\s+(.*))?--->$/` allows spaces before operation. Contradicts spec.

**A**: Correct. Pattern assumes no spaces. If spaces present, `\w+` won't match, parse fails.


## Line Number Tracking
**Q**: How track line numbers during parsing for 1-indexed errors?

**A**: Initialize counter to 1. Increment after processing each line. Store with each operation.

## TO Marker State
**Q**: How track if TO seen to validate REPLACE requirement?

**A**: Add `COLLECTING_SEARCH_TO` state. Transition through states enforces order.

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