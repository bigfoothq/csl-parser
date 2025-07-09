# nesl1

# formal grammar

Now formalize the grammar. The line-based constraint significantly simplifies parsing.

## Formal Grammar (EBNF)

```ebnf
document     = line*
line         = ws* (assignment | obj_end | arr_end | arr_element | multiline_end) ws* '\n'
             | ws* '\n'  (* blank line *)

assignment   = key ws* '=' ws* value
value        = string_literal | obj_start | arr_start | multiline_start

string_literal = 'R"""pv(' content ')pv"""'
content      = (* any UTF-8 chars until LAST ')pv"""' on line *)

obj_start    = '{'
obj_end      = '}'
arr_start    = '['
arr_end      = ']'
arr_element  = '-' ws* value
multiline_start = '('
multiline_end   = ')'

key          = key_char+
key_char     = (* any UTF-8 char except whitespace, '=', or zero-width *)
ws           = ' ' | '\t'
```

## Parser State Machine

```
States: ROOT, OBJECT, ARRAY, MULTILINE
Stack tracks: (state, key?, indent_level)

ROOT → assignment → push(OBJECT, key)
OBJECT → obj_start → push(OBJECT, null)
OBJECT → arr_start → push(ARRAY, null) 
OBJECT → multiline_start → push(MULTILINE, null)
OBJECT → obj_end → pop()
ARRAY → arr_element → stay
ARRAY → arr_end → pop()
MULTILINE → string_literal → accumulate
MULTILINE → multiline_end → pop(), join lines
```

Missing: How does parser know if assignment is at root vs inside object? Need to track whether we're "expecting a key" vs "in open object".

Problem: Grammar allows `key = value` at root level, contradicting "anonymous root object" decision.


# Valid  Nesl1 examples:

## Test Cases with JSON Equivalents

### Basic String Literals

```nesl1
simple = R"""pv(hello world)pv"""
empty = R"""pv()pv"""
spaces = R"""pv(  leading and trailing  )pv"""
special = R"""pv(!@#$%^&*(){}[]<>?/\|`~)pv"""
quotes = R"""pv("double" and 'single' quotes)pv"""
unicode = R"""pv(Hello 世界 🌍)pv"""
```

```json
{
  "simple": "hello world",
  "empty": "",
  "spaces": "  leading and trailing  ",
  "special": "!@#$%^&*(){}[]<>?/\\|`~",
  "quotes": "\"double\" and 'single' quotes",
  "unicode": "Hello 世界 🌍"
}
```

### String Containing End Marker

```nesl1
tricky1 = R"""pv(contains )pv""" in middle)pv"""
tricky2 = R"""pv(multiple )pv""" and )pv""" markers)pv"""
```

```json
{
  "tricky1": "contains )pv\"\"\" in middle",
  "tricky2": "multiple )pv\"\"\" and )pv\"\"\" markers"
}
```

### Multiple Delimiters on Line

```nesl1
concat = R"""pv(first)pv""" R"""pv(second)pv"""
nested = R"""pv(outer R"""pv(inner)pv""" text)pv"""
```

```json
{
  "concat": "first)pv\"\"\" R\"\"\"pv(second",
  "nested": "outer R\"\"\"pv(inner)pv\"\"\" text"
}
```

### Multiline Strings

```nesl1
paragraph = (
  R"""pv(Line 1)pv"""
  R"""pv(Line 2)pv"""
)

with_gaps = (
  R"""pv(Line 1)pv"""
  R"""pv()pv"""
  R"""pv(Line 3)pv"""
)

indented = (
  R"""pv(  Two spaces)pv"""
  R"""pv(    Four spaces)pv"""
  R"""pv(	Tab)pv"""
)
```

```json
{
  "paragraph": "Line 1\nLine 2",
  "with_gaps": "Line 1\n\nLine 3",
  "indented": "  Two spaces\n    Four spaces\n\tTab"
}
```

### Objects

```nesl1
user = {
  name = R"""pv(Alice)pv"""
  address = {
    street = R"""pv(123 Main)pv"""
    city = R"""pv(Wonderland)pv"""
  }
}

empty_obj = {}

config = {
  description = (
    R"""pv(This is a)pv"""
    R"""pv(multiline description)pv"""
  )
}
```

```json
{
  "user": {
    "name": "Alice",
    "address": {
      "street": "123 Main",
      "city": "Wonderland"
    }
  },
  "empty_obj": {},
  "config": {
    "description": "This is a\nmultiline description"
  }
}
```

### Arrays

```nesl1
colors = [
  - R"""pv(red)pv"""
  - R"""pv(green)pv"""
  - R"""pv(blue)pv"""
]

mixed = [
  - R"""pv(string)pv"""
  - {
    type = R"""pv(object)pv"""
  }
  - [
    - R"""pv(nested)pv"""
    - R"""pv(array)pv"""
  ]
]

empty_arr = []

poems = [
  - (
    R"""pv(Roses are red)pv"""
    R"""pv(Violets are blue)pv"""
  )
  - R"""pv(Single line poem)pv"""
]
```

```json
{
  "colors": ["red", "green", "blue"],
  "mixed": [
    "string",
    {"type": "object"},
    ["nested", "array"]
  ],
  "empty_arr": [],
  "poems": [
    "Roses are red\nViolets are blue",
    "Single line poem"
  ]
}
```

### Edge Cases - Keys

```nesl1
世界 = R"""pv(world)pv"""
café = R"""pv(coffee)pv"""
_underscore = R"""pv(ok)pv"""
dollar$sign = R"""pv(ok)pv"""
with-dash = R"""pv(ok)pv"""
number123 = R"""pv(ok)pv"""
```

```json
{
  "世界": "world",
  "café": "coffee",
  "_underscore": "ok",
  "dollar$sign": "ok",
  "with-dash": "ok",
  "number123": "ok"
}
```

### Complex Nesting

```nesl1
users = [
  - {
    name = R"""pv(Alice)pv"""
    bio = (
      R"""pv(Software engineer)pv"""
      R"""pv(Loves parsing)pv"""
    )
    tags = [
      - R"""pv(parser)pv"""
      - R"""pv(compiler)pv"""
    ]
  }
]
metadata = {
  version = R"""pv(1.0)pv"""
  arrays_in_arrays = [
    - [
      - R"""pv(nested)pv"""
    ]
  ]
}
```

```json
{
  "users": [{
    "name": "Alice",
    "bio": "Software engineer\nLoves parsing",
    "tags": ["parser", "compiler"]
  }],
  "metadata": {
    "version": "1.0",
    "arrays_in_arrays": [["nested"]]
  }
}
```


### Critical Parsing Challenges

1. **Line scanning**: Must find LAST `')pv"""'` to handle embedded markers
2. **Multiple literals per line**: Everything after first complete literal becomes part of its content
3. **Root object**: No explicit braces needed at top level
4. **Array dash**: Can have arbitrary whitespace before/after `-`




# Invalid Examples:

## NESL1 Parser Error Cases

### String Literal Errors

```nesl1
# Unterminated string
key = R"""pv(hello world

# Missing opening marker  
key = just text)pv"""

# Malformed markers
key = R"""pv(text)pv"
key = R"""pv(text)pv""
key = R""pv(text)pv"""
key = R'''pv(text)pv'''

# Not alone on line
key = R"""pv(text)pv""" extra stuff
prefix R"""pv(text)pv"""
{ key = R"""pv(val)pv"""
key = R"""pv(val)pv""" }
```

### Key Errors

```nesl1
# Invalid characters
key with space = R"""pv(value)pv"""
key=with=equal = R"""pv(value)pv"""
key	tab = R"""pv(value)pv"""

# Empty/missing keys
= R"""pv(no key)pv"""
 = R"""pv(empty key after space)pv"""

# Zero-width characters (U+200B example)
key​withzero = R"""pv(invisible char)pv"""
```

### Assignment Errors

```nesl1
# Missing value
key =
key = 

# No key
R"""pv(orphan value)pv"""
```

### Structural Mismatches

```nesl1
# Wrong closing delimiter
obj = {
  key = R"""pv(value)pv"""
]

arr = [
  - R"""pv(value)pv"""
}

key = (
  R"""pv(line)pv"""
}

# No opening delimiter
}
]
)
```

### Context Violations

```nesl1
# Array syntax in object
obj = {
  key = R"""pv(value)pv"""
  - R"""pv(array element)pv"""
}

# Object syntax in array  
arr = [
  key = R"""pv(assignment)pv"""
]

# Array element outside array (at root)
- R"""pv(orphan element)pv"""

# Invalid multiline content
key = (
  not a string literal
)

key = (
  }
)

key = (
  other = R"""pv(assignment)pv"""
)

# Empty multiline
key = (
)
```

### Parse State Errors

```nesl1
# Unclosed structures
obj = {
  key = R"""pv(value)pv"""
# EOF

arr = [
  - R"""pv(value)pv"""
# EOF

key = (
  R"""pv(line)pv"""
# EOF

# Duplicate keys
obj = {
  key = R"""pv(first)pv"""
  key = R"""pv(second)pv"""
}
```

### Line Structure Violations

```nesl1
# Multiple statements (even though some parse correctly)
key = { inner = R"""pv(val)pv""" }

# Line continuation attempts
key = \
  R"""pv(value)pv"""

key = R"""pv(broken \
  across lines)pv"""
```


# development approach:

**Executable specification** = working parser code that defines the language through implementation rather than abstract notation.

Instead of:
```ebnf
string_literal = 'R"""pv(' content ')pv"""'
content = (* chars between first '(' and last ')pv"""' *)
```

Write:
```python
def parse_string_literal(line):
    if not line.strip().startswith('R"""pv('):
        return None
    
    end_pos = line.rfind(')pv"""')
    if end_pos == -1:
        raise ParseError("Unterminated string")
    
    start_pos = line.find('(') + 1
    return line[start_pos:end_pos]
```

Benefits:
- Unambiguous algorithm for edge cases
- Testable against examples
- Handles errors explicitly
- No translation gap between spec and implementation

For NESL1, ~200 lines would cover:
- Line classification
- State transitions
- String parsing
- Error handling

This code **is** the specification. Implementers port it rather than interpret grammar.


## Summary of Final Decisions

### Core Parsing Rules
1. **Line-oriented**: Each line atomic, no continuations
2. **Context-sensitive**: Line validity depends on parser state (ROOT/OBJECT/ARRAY/MULTILINE)
3. **Implicit root**: Document begins in object context without `{`
4. **String parsing**: Right-to-left scan for last `')pv"""'`, content between first `'('` and that position

### Data Model
1. **Whitespace**: Preserved exactly in strings, stripped around syntax
2. **Empty structures**: `{}`, `[]`, `()` all valid
3. **Duplicate keys**: Last value wins
4. **Array elements**: `-` can precede any value type on same line
5. **Multiline**: Only string literals allowed, joined with `\n`

### Error Handling
1. **Recovery**: Skip invalid line, continue parsing
2. **Context violations**: Error if line type invalid for current state
3. **Malformed strings**: Error if missing markers or unterminated

### Unspecified Edge Cases
1. **Line endings**: Accept `\n` or `\r\n`, normalize to `\n`
2. **Unicode**: No normalization, keys are raw byte sequences minus whitespace/=/zero-width
3. **Empty multiline with whitespace**: Produces empty string

Ready to write reference parser or need clarification on any decision?

## Parser Specification Conclusions

**Grammar + state machine insufficient** for NESL1 because:

1. **Context sensitivity**: `key = val` valid only in object contexts - EBNF can't express this cleanly
2. **Algorithmic string parsing**: "last `')pv"""'`" requires procedural description, not pattern matching
3. **Semantic gaps**: Grammar doesn't specify where parsed values go or how structures compose

**Pure state machine** lacks:
- Line tokenization rules
- String parsing algorithm  
- Error recovery behavior
- Data structure mutations

**Executable specification optimal** because:
- Unambiguous for edge cases (unterminated strings, malformed markers)
- Testable against examples
- No translation from formal notation to implementation
- ~200 lines captures complete semantics

**Alternatives considered**:
- **Operational semantics**: `⟨line, state⟩ → ⟨state', output⟩` - but duplicates what code shows clearly
- **PEG/parser combinator**: Still needs custom string parsing, context tracking
- **Lexer/parser split**: Overengineered for line-based format

**Key insight**: NESL1's line-oriented design + context sensitivity makes it poorly suited for traditional formal grammars. The language is simple enough that well-structured code serves as better specification than abstract notation.

###################################

## NESL1 Final Decisions Summary

### Block Structure
- Every NESL1 block wrapped in markers:
  - Opening: `<<<<<<<<nesl1` (exact match, alone on line)
  - Closing: `>>>>>>>>nesl1` (exact match, alone on line)
- Opening `{` must be first non-whitespace on line after opening marker
- Closing `}` must be followed by closing marker
- Wrong closing marker = syntax error
- Multiple blocks are completely isolated
- Parse errors in one block don't affect others

### String Literal Parsing
- Format: `R"""pv(content)pv"""`
- Algorithm: Find LAST occurrence of `')pv"""'` on line
- Content: Everything between first `'('` and last `')pv"""'`
- Multiple literals per line: Everything after first literal's closing becomes part of its content
- Example: `concat = R"""pv(first)pv""" R"""pv(second)pv"""` → `"first)pv\"\"\" R\"\"\"pv(second"`

### Parser State Machine
- Initial state: `[(OBJECT, None, 0)]` after seeing `{`
- States: OBJECT, ARRAY, MULTILINE
- Transitions:
  - OBJECT → `{` → push(OBJECT)
  - OBJECT → `[` → push(ARRAY)
  - OBJECT → `(` → push(MULTILINE)
  - ARRAY → `-` followed by any value type (including objects/arrays)
  - Closing delimiters pop state

### Data Model
- Keys: Any UTF-8 except whitespace, `=`, zero-width characters
- Empty structures allowed: `{}`, `[]`, `()`
- Multiline: Only string literals, joined with `\n`
- Empty multiline `()` produces empty string
- Duplicate keys: Last value wins
- Whitespace preserved exactly in strings, stripped around syntax

### Error Handling
- Structural errors (mismatched delimiters) are fatal within block
- Other errors skip current line but maintain state stack
- No error recovery across block boundaries
- No statement delimiters for synchronization

### Line Processing
- Each line atomic, no continuations
- Line type determined by first non-whitespace
- Context-sensitive: validity depends on parser state
- Line endings: Accept `\n` or `\r\n`, normalize to `\n`

### Implementation
- ~300-400 lines (not 200):
  - Block extraction: 50 lines
  - Line classification: 50 lines
  - State management: 100 lines
  - String parsing: 50 lines
  - Error handling: 100 lines
  - Data structure building: 50 lines

### Unresolved
- Can blank lines appear between `}` and `>>>>>>>>nesl1`?
    --> NO
- Behavior of whitespace-only lines in objects/arrays
    --> ignored
- Whether arrays can be empty with just whitespace/newlines between `[` and `]`
    --> no. no null or missing values.  (empty strings are fine ofc)


# NESL1 Parser Clarifications

## 1. String Literal Termination

**Rule**: After `')pv"""'`, only whitespace permitted on remainder of line.

**Rationale**: Original "find last occurrence" algorithm ambiguous. Given:
```nesl1
key = R"""pv(text)pv""" extra content
```
Algorithm would yield `"text)pv""" extra content"` as value.

**Implementation**: Parse until `')pv"""'`, consume trailing whitespace, error on any other characters.

## 2. Block Delimiter Constraints

**Rules**:
- Opening `{` must be sole non-whitespace on line after `<<<<<<<<nesl1`
- Closing `}` must be sole non-whitespace on line before `>>>>>>>>nesl1`  
- No intervening lines between `}` and `>>>>>>>>nesl1`

**Rationale**: Original showed example but no formal constraints. Without these rules, parser cannot distinguish:
```nesl1
<<<<<<<<nesl1
{ key = R"""pv(})pv""" }
>>>>>>>>nesl1
```

**Implementation**: Enforce strict line sequence. Any deviation = syntax error.

## 3. Array Element Prefix

**Rule**: Dash `-` may have arbitrary whitespace before value.

**Valid**:
```nesl1
-value
- value
-   value
```

**Rationale**: Examples showed single space, but tokenization rules unspecified.

**Implementation**: After `-`, skip whitespace, then parse value (string/object/array/multiline).

## 4. Error Classification

**Fatal** (abort block):
- Mismatched delimiters (`{]`, unclosed structures)
- Missing closing marker
- EOF before `>>>>>>>>nesl1`

**Recoverable** (skip line):
- Invalid key characters
- Malformed string literals
- Assignment outside object context

**Rationale**: Original "skip line" insufficient for structural integrity.

**Implementation**: Track delimiter stack. Mismatch = abort. Other errors = skip line if possible.

## 5. Parser State Initialization

**Rule**: After `<<<<<<<<nesl1` and `{`, push `(OBJECT, None, 0)` onto state stack.

**Rationale**: Original grammar showed ROOT state but examples implied immediate object context. No explicit initialization specified.

**Implementation**: 
```
1. Scan for <<<<<<<<nesl1
2. Read next line, verify single {
3. Push OBJECT state
4. Begin parsing content
```

**Note**: Stack must be empty after `}` processed, else error.    


# tests

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Parser functions to be implemented
import {
  parseBlock,
  parseDocument,
  ParseError
} from './nesl1-parser.js';

describe('NESL1 Parser', () => {
  describe('Block extraction', () => {
    it('extracts valid block', () => {
      const input = `
<<<<<<<<nesl1
{
  key = R"""pv(value)pv"""
}
>>>>>>>>nesl1
`;
      const blocks = extractBlocks(input);
      assert.equal(blocks.length, 1);
      assert.equal(blocks[0].startLine, 2);
      assert.deepEqual(blocks[0].lines, [
        '{',
        '  key = R"""pv(value)pv"""',
        '}'
      ]);
    });

    it('rejects block without opening brace', () => {
      const input = `
<<<<<<<<nesl1
key = R"""pv(value)pv"""
>>>>>>>>nesl1
`;
      assert.throws(() => extractBlocks(input), ParseError);
    });

    it('rejects block with content after closing brace', () => {
      const input = `
<<<<<<<<nesl1
{
}
extra line
>>>>>>>>nesl1
`;
      assert.throws(() => extractBlocks(input), ParseError);
    });

    it('handles multiple blocks', () => {
      const input = `
<<<<<<<<nesl1
{
  a = R"""pv(1)pv"""
}
>>>>>>>>nesl1

<<<<<<<<nesl1
{
  b = R"""pv(2)pv"""
}
>>>>>>>>nesl1
`;
      const blocks = extractBlocks(input);
      assert.equal(blocks.length, 2);
    });
  });

  describe('String literal parsing', () => {
    it('parses simple string', () => {
      const result = parseStringLiteral('R"""pv(hello world)pv"""');
      assert.equal(result.value, 'hello world');
      assert.equal(result.endPos, 23);
    });

    it('handles empty string', () => {
      const result = parseStringLiteral('R"""pv()pv"""');
      assert.equal(result.value, '');
    });

    it('finds last marker', () => {
      const result = parseStringLiteral('R"""pv(contains )pv""" marker)pv"""');
      assert.equal(result.value, 'contains )pv""" marker');
    });

    it('rejects unterminated string', () => {
      assert.throws(
        () => parseStringLiteral('R"""pv(no end'),
        /Unterminated string/
      );
    });

    it('rejects content after string', () => {
      assert.throws(
        () => parseStringLiteral('R"""pv(text)pv""" extra'),
        /after string literal/
      );
    });
  });

  describe('Line classification', () => {
    it('identifies assignment', () => {
      const line = classifyLine('key = R"""pv(value)pv"""');
      assert.equal(line.type, 'assignment');
      assert.equal(line.key, 'key');
    });

    it('identifies object start', () => {
      const line = classifyLine('obj = {');
      assert.equal(line.type, 'assignment');
      assert.equal(line.valueType, 'object_start');
    });

    it('identifies array element', () => {
      const line = classifyLine('  - R"""pv(item)pv"""');
      assert.equal(line.type, 'array_element');
    });

    it('rejects invalid key characters', () => {
      assert.throws(() => classifyLine('key with space = R"""pv(x)pv"""'));
      assert.throws(() => classifyLine('key=bad = R"""pv(x)pv"""'));
    });
  });

  describe('State transitions', () => {
    it('maintains state stack', () => {
      const parser = new Parser();
      parser.pushState('OBJECT', null);
      
      parser.processLine('nested = {');
      assert.equal(parser.stateStack.length, 2);
      assert.equal(parser.currentState(), 'OBJECT');
      
      parser.processLine('}');
      assert.equal(parser.stateStack.length, 1);
    });

    it('rejects array syntax in object', () => {
      const parser = new Parser();
      parser.pushState('OBJECT', null);
      
      assert.throws(
        () => parser.processLine('- R"""pv(element)pv"""'),
        /Array element not allowed in object/
      );
    });

    it('rejects assignment in array', () => {
      const parser = new Parser();
      parser.pushState('ARRAY', null);
      
      assert.throws(
        () => parser.processLine('key = R"""pv(value)pv"""'),
        /Assignment not allowed in array/
      );
    });
  });

  describe('Multiline strings', () => {
    it('joins lines with newline', () => {
      const parser = new Parser();
      parser.pushState('OBJECT', null);
      
      parser.processLine('text = (');
      parser.processLine('  R"""pv(line 1)pv"""');
      parser.processLine('  R"""pv(line 2)pv"""');
      const result = parser.processLine(')');
      
      assert.equal(result.value, 'line 1\nline 2');
    });

    it('handles empty multiline', () => {
      const parser = new Parser();
      parser.pushState('OBJECT', null);
      
      parser.processLine('empty = (');
      const result = parser.processLine(')');
      
      assert.equal(result.value, '');
    });

    it('rejects non-string in multiline', () => {
      const parser = new Parser();
      parser.pushState('OBJECT', null);
      
      parser.processLine('bad = (');
      assert.throws(
        () => parser.processLine('  not a string'),
        /Only string literals allowed/
      );
    });
  });

  describe('Complete documents', () => {


    it('enforces strict block structure', () => {
        // Content on same line as opening brace
        const input1 = `
<<<<<<<<nesl1
{ key = R"""pv(value)pv"""
}
>>>>>>>>nesl1`;
  assert.throws(() => parseDocument(input1), /Opening brace must be alone/);

        // Content on same line as closing brace  
        const input2 = `
<<<<<<<<nesl1
{
  key = R"""pv(value)pv"""
} extra
>>>>>>>>nesl1`;
        assert.throws(() => parseDocument(input2), /Closing brace must be alone/);
    });

    it('parses minimal document', () => {
      const input = `
<<<<<<<<nesl1
{
  key = R"""pv(value)pv"""
}
>>>>>>>>nesl1
`;
      const result = parseDocument(input);
      assert.deepEqual(result, [{
        key: 'value'
      }]);
    });

    it('parses nested structures', () => {
      const input = `
<<<<<<<<nesl1
{
  user = {
    name = R"""pv(Alice)pv"""
    tags = [
      - R"""pv(admin)pv"""
      - R"""pv(user)pv"""
    ]
  }
}
>>>>>>>>nesl1
`;
      const result = parseDocument(input);
      assert.deepEqual(result, [{
        user: {
          name: 'Alice',
          tags: ['admin', 'user']
        }
      }]);
    });

    it('handles duplicate keys (last wins)', () => {
      const input = `
<<<<<<<<nesl1
{
  key = R"""pv(first)pv"""
  key = R"""pv(second)pv"""
}
>>>>>>>>nesl1
`;
      const result = parseDocument(input);
      assert.deepEqual(result, [{
        key: 'second'
      }]);
    });

    it('preserves whitespace in strings', () => {
      const input = `
<<<<<<<<nesl1
{
  spaced = R"""pv(  leading and trailing  )pv"""
}
>>>>>>>>nesl1
`;
      const result = parseDocument(input);
      assert.equal(result[0].spaced, '  leading and trailing  ');
    });
  });

  describe('Error recovery', () => {
    it('skips invalid lines in object', () => {
      const input = `
<<<<<<<<nesl1
{
  good = R"""pv(ok)pv"""
  bad key = R"""pv(skip)pv"""
  also_good = R"""pv(ok)pv"""
}
>>>>>>>>nesl1
`;
      const result = parseDocument(input);
      assert.deepEqual(result, [{
        good: 'ok',
        also_good: 'ok'
      }]);
    });

    it('aborts on structural errors', () => {
      const input = `
<<<<<<<<nesl1
{
  obj = {
    key = R"""pv(value)pv"""
  ]
}
>>>>>>>>nesl1
`;
      assert.throws(() => parseDocument(input), /Mismatched delimiters/);
    });
  });

  describe('Edge cases', () => {
    it('handles Unicode keys', () => {
      const input = `
<<<<<<<<nesl1
{
  世界 = R"""pv(world)pv"""
  café = R"""pv(coffee)pv"""
}
>>>>>>>>nesl1
`;
      const result = parseDocument(input);
      assert.equal(result[0]['世界'], 'world');
      assert.equal(result[0]['café'], 'coffee');
    });

    it('normalizes line endings', () => {
      const input = '<<<<<<<<nesl1\r\n{\r\n  key = R"""pv(value)pv"""\r\n}\r\n>>>>>>>>nesl1';
      const result = parseDocument(input);
      assert.deepEqual(result, [{ key: 'value' }]);
    });

    it('handles deeply nested structures', () => {
      const input = `
<<<<<<<<nesl1
{
  a = [
    - [
      - [
        - R"""pv(deep)pv"""
      ]
    ]
  ]
}
>>>>>>>>nesl1
`;
      const result = parseDocument(input);
      assert.deepEqual(result, [{
        a: [[['deep']]]
      }]);
    });
  });
});

// Helper function signatures (to be implemented)
function extractBlocks(input) {
  // Extract content between block markers
  throw new Error('Not implemented');
}

function parseStringLiteral(line) {
  // Parse R"""pv(...)pv""" format
  throw new Error('Not implemented');
}

function classifyLine(line) {
  // Determine line type and extract components
  throw new Error('Not implemented');
}

class Parser {
  constructor() {
    this.stateStack = [];
    this.output = null;
  }

  pushState(state, key) {
    throw new Error('Not implemented');
  }

  currentState() {
    throw new Error('Not implemented');
  }

  processLine(line) {
    throw new Error('Not implemented');
  }
}

class ParseError extends Error {
  constructor(message, line) {
    super(message);
    this.name = 'ParseError';
    this.line = line;
  }
}


#############################

TODO - MUST MAKE DELIMITERS CONFIGURABLE IN NESL.  TODO !!!!

as in each of these:

- `R"""pv(`
- `)pv"""`
- `<<<<<<<<nesl1`
- `>>>>>>>>nesl1`

#############################


# New NESL1 Decisions

https://claude.ai/chat/d7ce02fc-862e-4c5f-96c9-197f29882fae

### Block Wrappers
- Blocks wrapped in `<<<<<<<<nesl1` / `>>>>>>>>nesl1` markers
- Content between markers must be valid standalone NESL (starts with `{` or `[`)
- No implicit objects - even wrapped blocks need explicit `{` or `[`
- Multiple wrapped blocks in a document become an array of objects/values

### Parser Architecture  
- 2-stage: First extract blocks from mixed content, then parse NESL
- Each wrapped block parses independently (errors don't affect other blocks)

### Strictness
- No blank lines between `}` and `>>>>>>>>nesl1` (easier to parse - just check next line)
- Empty arrays cannot have whitespace between `[` and `]` - must be exactly `[]`
- Whitespace-only lines in objects/arrays are ignored

That's it! The main insight: wrapped blocks are just a way to embed valid NESL in mixed content. The wrapper doesn't change NESL syntax rules.

## Block Wrapper Example

**Input (mixed content):**
```
I'll help you create some files.

<<<<<<<<nesl1
{
  operation = R"""pv(create_file)pv"""
  path = R"""pv(/src/main.py)pv"""
  content = R"""pv(print("hello"))pv"""
}
>>>>>>>>nesl1

Now let's make a config:

<<<<<<<<nesl1
{
  operation = R"""pv(create_file)pv"""
  path = R"""pv(/config.json)pv"""
  content = R"""pv({"debug": true})pv"""
}
>>>>>>>>nesl1
```

**Output (extracted NESL array):**
```nesl
[
  - {
    operation = R"""pv(create_file)pv"""
    path = R"""pv(/src/main.py)pv"""
    content = R"""pv(print("hello"))pv"""
  }
  - {
    operation = R"""pv(create_file)pv"""
    path = R"""pv(/config.json)pv"""
    content = R"""pv({"debug": true})pv"""
  }
]
```

The block extractor:
1. Finds each `<<<<<<<<nesl1`...`>>>>>>>>nesl1` pair
2. Extracts the content between markers
3. Wraps all extracted objects in an array with `-` prefixes

#############################

# tests

ok now generate example files for FOR ONLY THESE FILES:


```
tests/
  cases/
    valid/
      001_basic_string.nesl
      001_basic_string.json
      002_nested_objects.nesl
      002_nested_objects.json
    errors/
      001_unterminated_string.nesl
      001_unterminated_string.json
```

## Valid Tests

### `tests/cases/valid/001_basic_string.nesl`
```nesl
<<<<<<<<nesl1
{
  message = R"""pv(hello world)pv"""
  empty = R"""pv()pv"""
  spaces = R"""pv(  leading and trailing  )pv"""
}
>>>>>>>>nesl1
```

### `tests/cases/valid/001_basic_string.json`
```json
[
  {
    "message": "hello world",
    "empty": "",
    "spaces": "  leading and trailing  "
  }
]
```

### `tests/cases/valid/002_nested_objects.nesl`
```nesl
<<<<<<<<nesl1
{
  user = {
    name = R"""pv(Alice)pv"""
    age = R"""pv(30)pv"""
    address = {
      street = R"""pv(123 Main St)pv"""
      city = R"""pv(Wonderland)pv"""
    }
  }
  tags = [
    - R"""pv(admin)pv"""
    - R"""pv(verified)pv"""
  ]
}
>>>>>>>>nesl1
```

### `tests/cases/valid/002_nested_objects.json`
```json
[
  {
    "user": {
      "name": "Alice",
      "age": "30",
      "address": {
        "street": "123 Main St",
        "city": "Wonderland"
      }
    },
    "tags": ["admin", "verified"]
  }
]
```

## Error Tests

### `tests/cases/errors/001_unterminated_string.nesl`
```nesl
<<<<<<<<nesl1
{
  good = R"""pv(this is fine)pv"""
  bad = R"""pv(this string never ends
  another = R"""pv(unreachable)pv"""
}
>>>>>>>>nesl1
```

### `tests/cases/errors/001_unterminated_string.json`
```json
{
  "errors": [
    {
      "line": 4,
      "code": "E001",
      "message": "Unterminated string literal"
    }
  ]
}
```