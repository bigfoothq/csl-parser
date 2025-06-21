
# CSL Parser Specification

CSL = 💚 Clada Syntax Language

## Purpose

The CSL (Clada Markup Language) parser transforms git-style conflict marker syntax into executable file operations and shell commands, optimizing for LLM-friendly input while maintaining deterministic parsing through recursive descent with strict state transitions.

## Overview

CSL uses git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) to delimit operations, eliminating escape sequences and CDATA complexity. The parser implements a state machine with recursive depth tracking to handle nested conflict markers in file content. Operations include file creation/modification (`WRITE`, `SEARCH/REPLACE`) and shell execution (`RUN`), with attributes encoded inline. Tasks execute sequentially within `TASKS` blocks, with block-level failure isolation.

## Architecture

### Lexical Analysis

**Token Types:**
- `MARKER_OPEN`: `<<<<<<< ` at line start + operation type + attributes
- `MARKER_CLOSE`: `>>>>>>> ` at line start + operation type/END
- `SEPARATOR`: `=======` at line start
- `CONTENT_LINE`: any line not matching above patterns

**Tokenization Rules:**
1. Markers recognized only at line boundaries (column 0)
2. Whitespace after marker prefix is required
3. Line endings preserved in content (LF normalized)

### Syntax Grammar (EBNF)

```ebnf
document     = (tasks_block | operation)*
tasks_block  = marker_open_tasks operation* marker_close_tasks
operation    = write | search_replace | search_range_replace | run

write        = marker_open_write content marker_close_end
run          = marker_open_run content marker_close_end
search_replace = marker_open_search content separator content marker_close_replace
search_range_replace = marker_open_search_start content 
                      marker_open_search_end content 
                      separator content marker_close_replace

marker_open_tasks  = "<<<<<<< TASKS" attributes? "\n"
marker_close_tasks = ">>>>>>> TASKS\n"
marker_open_write  = "<<<<<<< WRITE " attributes "\n"
marker_open_run    = "<<<<<<< RUN" attributes? "\n"
marker_open_search = "<<<<<<< SEARCH " attributes "\n"
marker_open_search_start = "<<<<<<< SEARCH-START " attributes "\n"
marker_open_search_end   = "<<<<<<< SEARCH-END\n"
separator          = "=======\n"
marker_close_end   = ">>>>>>> END\n"
marker_close_replace = ">>>>>>> REPLACE\n"

attributes   = attribute (" " attribute)*
attribute    = identifier "=" quoted_string
quoted_string = '"' ([^"] | '\"')* '"'
content      = (content_line | nested_operation)*
```

### Parser State Machine

**States:**
- `IDLE`: Between operations
- `IN_TASKS`: Inside TASKS block
- `IN_WRITE`: Collecting write content
- `IN_RUN`: Collecting command content
- `IN_SEARCH`: Collecting search pattern
- `IN_SEARCH_START`: Collecting range start pattern
- `IN_SEARCH_END`: Collecting range end pattern
- `IN_REPLACE`: Collecting replacement content

**Depth Tracking:**
- Maintain `depth` counter per operation type
- Increment on nested marker of same type
- Decrement on matching close marker
- Only transition states when depth=0

### Attribute Parsing

Format: `key="value"` pairs, space-separated

**Supported attributes:**
- `path` (required for WRITE, SEARCH operations)
- `count` (optional, default: 1)
- `append` (optional, default: false)
- `dir` (optional for RUN)
- `version` (optional for TASKS)

**Parsing algorithm:**
1. Extract substring after operation type
2. Regex match: `(\w+)="([^"]*)"`
3. Unescape `\"` within values
4. Validate required attributes per operation

### Recursive Parsing

**Nested marker handling:**
```
<<<<<<< WRITE path="example.md"
This file contains conflict markers:
<<<<<<< HEAD
some content
=======
other content
>>>>>>> branch
>>>>>>> END
```

**Algorithm:**
1. Track operation type on entry
2. When encountering `<<<<<<< ` in content:
   - If followed by current operation type: increment depth
   - Otherwise: treat as content
3. Process close markers only when depth reaches 0

### Error Handling

**Parse errors abort current block only:**
- Malformed attributes
- Missing required markers
- Unexpected state transitions

**Recovery strategy:**
- Skip to next `>>>>>>> TASKS` or document end
- Report line number and expected token
- Continue parsing subsequent blocks

## Design Rationale

**LLM Optimization:**
- Git conflict syntax familiar from training data
- No escape sequences reduce cognitive load
- Visual structure aids comprehension
- Nested content "just works"

**Parser Determinism:**
- Strict line-start marker recognition
- Unambiguous state transitions
- No lookahead beyond current line required
- O(n) parsing complexity

**Trade-offs:**
- Cannot represent literal `<<<<<<< OPERATION` at line start (rare in practice)
- Requires line-based processing (prevents some streaming optimizations)
- Larger input size vs XML (acceptable for clarity gains)

## Implementation Notes

**Performance considerations:**
- Buffer complete lines before marker detection
- Pre-compile regex patterns
- Use finite automaton for state transitions

**Validation requirements:**
- Path traversal prevention
- Command whitelist enforcement
- UTF-8 normalization
- Resource limits (file size, timeout)

> Generate a complete representative list of example syntax that our machine will need to be able to parse (ofc u dont have to include every possible attribute, but your examples should make the breadth of usage clear).  remember to include the optioanl task blocks



# CSL Parser Test Cases

## Standalone Operations

```
<<<<<<< WRITE path="simple.txt"
Hello world
>>>>>>> END

<<<<<<< WRITE path="data.csv" append="true"
row1,data1
row2,data2
>>>>>>> END

<<<<<<< RUN
npm test
>>>>>>> END

<<<<<<< RUN dir="/tmp"
python script.py --verbose
>>>>>>> END
```

## Search/Replace Variants

```
<<<<<<< SEARCH path="app.js" count="1"
const old = "value";
=======
const new = "updated";
>>>>>>> REPLACE

<<<<<<< SEARCH path="config.json" count="2"
"debug": false
=======
"debug": true
>>>>>>> REPLACE

<<<<<<< SEARCH-START path="main.py" count="1"
def process_data(
<<<<<<< SEARCH-END
    return result
=======
def process_data(data, options=None):
    if options is None:
        options = {}
    filtered = apply_filters(data, options)
    return filtered
>>>>>>> REPLACE
```

## Task Blocks

```
<<<<<<< TASKS
<<<<<<< WRITE path="src/index.js"
console.log("app");
>>>>>>> END
<<<<<<< RUN
npm install
>>>>>>> END
>>>>>>> TASKS

<<<<<<< TASKS version="1.1"
<<<<<<< SEARCH path="package.json" count="1"
"version": "1.0.0"
=======
"version": "1.1.0"
>>>>>>> REPLACE
<<<<<<< RUN
git commit -m "bump version"
>>>>>>> END
>>>>>>> TASKS
```

## Nested Conflict Markers

```
<<<<<<< WRITE path="git-tutorial.md"
# Resolving Conflicts

When you see:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> branch-name

Choose which version to keep.
>>>>>>> END

<<<<<<< WRITE path="test-cases.txt"
<<<<<<< WRITE path="nested.txt"
This is not a real command
>>>>>>> END
>>>>>>> END
```

## Edge Cases

```
<<<<<<< WRITE path="empty.txt"
>>>>>>> END

<<<<<<< RUN

>>>>>>> END

<<<<<<< SEARCH path="minimal.js" count="1"
x
=======
y
>>>>>>> REPLACE

<<<<<<< WRITE path="multiline-attrs.js"
<<<<<<< RUN dir="/app"
echo "this line starts with marker pattern"
>>>>>>> END

<<<<<<< SEARCH-START path="complex.js" count="1"
<<<<<<< SEARCH-START
<<<<<<< SEARCH-END
=======
>>>>>>> REPLACE
```

## Multiple Operations

```
<<<<<<< WRITE path="build/output.js"
export default {};
>>>>>>> END
<<<<<<< TASKS
<<<<<<< RUN
mkdir -p dist
>>>>>>> END
<<<<<<< RUN
cp build/output.js dist/
>>>>>>> END
>>>>>>> TASKS
<<<<<<< SEARCH path="dist/output.js" count="1"
export default {};
=======
export default { version: "1.0" };
>>>>>>> REPLACE
```

## Invalid Syntax (Parser Must Handle)

```
<<<<<<< WRITE
missing required path attribute
>>>>>>> END

<<<<<<< SEARCH path="file.js"
missing separator and replace section
>>>>>>> REPLACE

<<<<<<< WRITE path="unclosed.txt"
never closed

<<<<<<< TASKS
<<<<<<< WRITE path="file.txt"
content
>>>>>>> END
missing TASKS close marker
```

> The count attribute is optional, as it defaults to one. Is that obvious in your examples? Or do we need another one? Also, we need another option for account where it could be a number or it could be the word "any"




The examples don't make the optional nature of `count` clear - I included it on every SEARCH operation. Need examples without it:

```
<<<<<<< SEARCH path="app.js"
const old = "value";
=======
const new = "updated";
>>>>>>> REPLACE

<<<<<<< SEARCH-START path="main.py"
def process_data(
<<<<<<< SEARCH-END
    return result
=======
def process_data(data, options=None):
    return apply_filters(data, options)
>>>>>>> REPLACE
```

For `count="any"`:

```
<<<<<<< SEARCH path="config.json" count="any"
"debug": false
=======
"debug": true
>>>>>>> REPLACE

<<<<<<< SEARCH-START path="test.py" count="any"
assert x == 
<<<<<<< SEARCH-END
10
=======
assert x == 20
>>>>>>> REPLACE
```

The grammar needs updating:
```ebnf
attribute    = identifier "=" (quoted_string | "any")
```

And parser logic: `count="any"` means replace all occurrences, no validation on match count.

$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

# UPDATES/ REFINEMENTS:

## CSL Parser Refinements from Original Spec

### Major Architecture Decisions

**1. No Streaming**
- Buffer entire input (50MB max)
- Simplifies line-boundary detection
- Memory: ~50MB string → ~10MB AST

**2. Custom Attribute Parser**
- No HTML parser dependency
- Handle escapes manually: `path="file \"name\".txt"`
- Type conversion: `count="3"` → number, `append="true"` → boolean
- Boolean attributes: `disabled` → `{disabled: true}`

**3. Line Processing**
- Normalize CRLF → LF
- Ensure trailing newline
- Line-based tokenization (no regex)

### Parser Implementation

**4. State Machine Approach**
- States: IDLE, IN_TASKS, IN_WRITE, IN_RUN, IN_SEARCH, IN_SEARCH_START, IN_SEARCH_END, IN_REPLACE
- Function table for transitions
- No parser generators

**5. Depth Tracking Refinement**
- Map per operation type: `Map<'WRITE'|'TASKS'|etc, number>`
- Mixed nesting: Different operation types don't increment depth
- Only same-type nesting affects depth counter

**6. Error Recovery**
- Parse errors abort current block only
- Recovery: Skip to next `<<<<<<< ` at depth 0
- If depth corrupted, fallback heuristics needed

### Specific Clarifications

**7. Attribute Handling**
- Duplicate attributes: Last-wins (HTML convention)
- Path validation: Parse liberally, validate at execution
- `count="any"` for replace-all (not just 999999)

**8. Empty Operations**
- Empty WRITE creates empty file (not error)
- Empty RUN: Implementation choice

**9. Error Reporting**
- Line + column + char position
- Start position (not end) for multi-line content
- Context lines in error messages

### Unresolved/Deferred

- Exact escape sequences in attributes (just `\"` or full set?)
- `count="any"` behavior for SEARCH-START/END ranges
- State transition table details
- Content accumulation strategy (strings vs line ranges)

> Did we miss anything?

Yes, several items:

**1. Parser Input/Output Contract**
- Input: UTF-8 string
- Output: `{ tasks: Task[], errors: ParseError[] }`
- Task structure undefined

**2. Error Object Structure**
- Fields needed: message, type, line, column, charPos, operation, context
- Error codes/types enumeration missing

**3. Marker Recognition Edge Cases**
- `<<<<<<< ` with 8 spaces vs 7 (strict match?)
- Case sensitivity: `<<<<<<< WRITE` vs `<<<<<<< write`
- Trailing whitespace: `<<<<<<< WRITE   \n`

**4. Attribute Parser Gaps**
- Number parsing: floats vs integers, scientific notation?
- Boolean values: just `true/false` or also `yes/no`, `1/0`?
- Null/undefined: `key=""` vs missing key

**5. TASKS Block Semantics**
- Version attribute behavior undefined
- Can TASKS blocks nest?
- Do task numbers reset per block?

**6. Content Handling**
- Line ending preservation in content
- Empty lines in content blocks
- Trailing newline in last content line

**7. Performance Decisions**
- Why custom parser over regex for attributes
- Content string building vs array join

**8. Testing Strategy**
- Parser test isolation from executor
- Error case coverage

These affect implementation complexity significantly.