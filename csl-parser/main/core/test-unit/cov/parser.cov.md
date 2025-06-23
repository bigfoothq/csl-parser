20250123

# CSL Parser Covenant

parse(text, options?) → Operation[]

## Test Implementation Decisions

### Structure
- Mirror covenant hierarchy exactly: describe blocks for sections (operations/attributes/content), nested describes for subsections
- One test per named covenant section containing all examples
- No cross-test shared state or setup/teardown
- Use Node.js built-in test runner (`node:test`) with `assert.strictEqual` and `assert.deepStrictEqual`

### Test Organization
```javascript
describe('operations', () => {
  describe('write', () => {
    describe('basic', () => {
      test('Simple WRITE operations', () => {
        // All 3 examples from operations.write.basic
      });
    });
  });
});
```

### Assertions
- **Success cases**: `assert.deepStrictEqual(parse(input), expectedAST)`
- **Error cases**: `assert.throws(() => parse(input), { message: 'exact error string' })`
- Exact string matching for errors (no regex patterns)
- No custom assertion helpers

### String Handling
- **Multi-line content**: Use template literals for readability
- **Line ending tests**: Use explicit `\r\n`, `\r`, `\n` escape sequences
- **Quote escaping tests**: Match covenant exactly (e.g., `"test\\"quote.txt"`)

### No Parameterization
- Each covenant example gets explicit assertion
- No data-driven test loops
- Rationale: Covenant lists each case separately for debugging clarity

### Edge Cases
- Custom delimiter tests pass options as second parameter
- Empty content tests verify zero-byte strings (`content: ''`)
- Line numbers in errors must match exactly

### Implementation Notes
- Import parser from `'../../src/parser'` (no extension in TypeScript imports)
- Test file: `parser.test.ts`
- Parser implementation: `parser.ts` 
- No test-specific utilities or helpers
- Follow covenant order exactly
- Build before test: `tsc && node --test dist/main/core/test-unit/test/parser.test.js`

## operations.write.basic

### Simple WRITE operations

- parse('<---WRITE file="test.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]

- parse('<---WRITE file="data.csv"--->
hello world
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'data.csv', content: 'hello world'}]

- parse('<---WRITE file="path/to/file.js"--->
const x = 1;
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'path/to/file.js', content: 'const x = 1;'}]

## operations.write.append

### WRITE with append attribute

- parse('<---WRITE file="log.txt" append="true"--->
new entry
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'log.txt', append: 'true', content: 'new entry'}]

- parse('<---WRITE file="data.csv" append="false"--->
overwrite content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'data.csv', append: 'false', content: 'overwrite content'}]

## operations.write.multiple_attrs

### WRITE with multiple attributes

- parse('<---WRITE file="test.txt" append="true" custom="value"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', append: 'true', custom: 'value', content: 'content'}]

## operations.run.basic

### Simple RUN operations

- parse('<---RUN--->
echo hello
<---END--->') 
→ [{type: 'RUN', line: 1, content: 'echo hello'}]

- parse('<---RUN--->
npm install
npm test
<---END--->') 
→ [{type: 'RUN', line: 1, content: 'npm install\nnpm test'}]

## operations.run.dir

### RUN with dir attribute

- parse('<---RUN dir="/workspace"--->
pwd
<---END--->') 
→ [{type: 'RUN', line: 1, dir: '/workspace', content: 'pwd'}]

- parse('<---RUN dir="./src"--->
ls -la
<---END--->') 
→ [{type: 'RUN', line: 1, dir: './src', content: 'ls -la'}]

## operations.search.simple

### Pattern → replace

- parse('<---SEARCH file="config.json"--->
"debug": false
<---REPLACE--->
"debug": true
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'config.json', pattern: '"debug": false', replacement: '"debug": true'}]

- parse('<---SEARCH file="app.js"--->
oldValue
<---REPLACE--->
newValue
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'app.js', pattern: 'oldValue', replacement: 'newValue'}]

- parse('<---SEARCH file="test.py"--->
def process():
    return None
<---REPLACE--->
def process():
    return 42
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'test.py', pattern: 'def process():\n    return None', replacement: 'def process():\n    return 42'}]

## operations.search.range

### Pattern → to → replace

- parse('<---SEARCH file="main.py"--->
def process(
<---TO--->
    return result
<---REPLACE--->
def process(data):
    return data
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'main.py', pattern: 'def process(', to: '    return result', replacement: 'def process(data):\n    return data'}]

## operations.search.count

### SEARCH with count attribute

- parse('<---SEARCH file="test.js" count="3"--->
foo
<---REPLACE--->
bar
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'test.js', count: '3', pattern: 'foo', replacement: 'bar'}]

- parse('<---SEARCH file="data.txt" count="all"--->
old
<---REPLACE--->
new
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'data.txt', count: 'all', pattern: 'old', replacement: 'new'}]

## operations.tasks.empty

### Empty TASKS block

- parse('<---TASKS--->
<---END--->') 
→ [{type: 'TASKS', line: 1, operations: []}]

- parse('<---TASKS version="1.0"--->
<---END--->') 
→ [{type: 'TASKS', line: 1, version: '1.0', operations: []}]

## operations.tasks.single_op

### TASKS with one operation

- parse('<---TASKS--->
<---WRITE file="test.txt"--->
content
<---END--->
<---END--->') 
→ [{type: 'TASKS', line: 1, operations: [
    {type: 'WRITE', line: 2, file: 'test.txt', content: 'content'}
]}]

## operations.tasks.multiple_ops

### TASKS with multiple operations

- parse('<---TASKS--->
<---WRITE file="file1.txt"--->
content1
<---END--->
<---RUN--->
echo done
<---END--->
<---SEARCH file="config.json"--->
false
<---REPLACE--->
true
<---END--->
<---END--->') 
→ [{type: 'TASKS', line: 1, operations: [
    {type: 'WRITE', line: 2, file: 'file1.txt', content: 'content1'},
    {type: 'RUN', line: 5, content: 'echo done'},
    {type: 'SEARCH', line: 8, file: 'config.json', pattern: 'false', replacement: 'true'}
]}]

## attributes.syntax.double_quotes

### attr="value"

- parse('<---WRITE file="test.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]

- parse('<---WRITE file="path with spaces.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'path with spaces.txt', content: 'content'}]

## attributes.syntax.single_quotes

### attr='value'

- parse("<---WRITE file='test.txt'--->
content
<---END--->") 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]

- parse("<---WRITE file='quote\"inside.txt'--->
content
<---END--->") 
→ [{type: 'WRITE', line: 1, file: 'quote"inside.txt', content: 'content'}]

## attributes.syntax.empty_values

### attr=""

- parse('<---WRITE file="" append="true"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: '', append: 'true', content: 'content'}]

- parse('<---RUN dir=""--->
pwd
<---END--->') 
→ [{type: 'RUN', line: 1, dir: '', content: 'pwd'}]

## attributes.syntax.whitespace

### attr = "value" variations

- parse('<---WRITE file = "test.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]

- parse('<---WRITE file="test.txt"    append="true"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', append: 'true', content: 'content'}]

## attributes.syntax.exotic_names

### Non-alphanumeric attribute names

- parse('<---WRITE @file="test.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, '@file': 'test.txt', content: 'content'}]

- parse('<---WRITE file-name="test.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, 'file-name': 'test.txt', content: 'content'}]

- parse('<---WRITE 123="numeric.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, '123': 'numeric.txt', content: 'content'}]

- parse('<---WRITE $$$="special.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, '$$$': 'special.txt', content: 'content'}]

## attributes.escaping.double_quotes

### \" inside double quotes

- parse('<---WRITE file="test\\"quote.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test"quote.txt', content: 'content'}]

- parse('<---WRITE file="a\\"b\\"c.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'a"b"c.txt', content: 'content'}]

## attributes.escaping.single_quotes

### \' inside single quotes

- parse("<---WRITE file='test\\'quote.txt'--->
content
<---END--->") 
→ [{type: 'WRITE', line: 1, file: "test'quote.txt", content: 'content'}]

## attributes.escaping.literal_backslash

### \\ sequences

- parse('<---WRITE file="test\\\\file.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test\\file.txt', content: 'content'}]

- parse('<---WRITE file="C:\\\\Users\\\\test.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'C:\\Users\\test.txt', content: 'content'}]

- parse('<---WRITE file="test\\nfile.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test\\nfile.txt', content: 'content'}]

- parse('<---WRITE file="test\\tfile.txt"--->
content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test\\tfile.txt', content: 'content'}]

## attributes.errors.duplicates

### Duplicate attribute detection

- parse('<---WRITE file="test.txt" file="other.txt"--->
content
<---END--->') 
→ Error("Line 1: Duplicate attribute: file")

- parse('<---SEARCH file="test.js" count="1" count="all"--->
pattern
<---REPLACE--->
replacement
<---END--->') 
→ Error("Line 1: Duplicate attribute: count")

## attributes.errors.unterminated

### Unterminated quotes

- parse('<---WRITE file="test.txt--->
content
<---END--->') 
→ Error("Line 1: Unterminated quoted value")

- parse("<---WRITE file='test.txt--->
content
<---END--->") 
→ Error("Line 1: Unterminated quoted value")

## attributes.errors.unquoted

### attr=value (no quotes)

- parse('<---WRITE file=test.txt--->
content
<---END--->') 
→ Error("Line 1: Unquoted attribute value")

## attributes.errors.mismatched_quotes

### Mismatched quote types

- parse('<---WRITE file="test.txt\'--->
content
<---END--->') 
→ Error("Line 1: Unterminated quoted value")

- parse("<---WRITE file='test.txt\"--->
content
<---END--->") 
→ Error("Line 1: Unterminated quoted value")

## content.basic.empty

### Zero bytes between markers

- parse('<---WRITE file="test.txt"--->
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: ''}]

- parse('<---RUN--->
<---END--->') 
→ [{type: 'RUN', line: 1, content: ''}]

- parse('<---SEARCH file="test.js"--->
<---REPLACE--->
replacement
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'test.js', pattern: '', replacement: 'replacement'}]

- parse('<---SEARCH file="test.js"--->
pattern
<---REPLACE--->
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'pattern', replacement: ''}]

## content.basic.single_line

### One line of content

- parse('<---WRITE file="test.txt"--->
single line
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'single line'}]

## content.basic.multi_line

### Multiple lines

- parse('<---WRITE file="test.txt"--->
line 1
line 2
line 3
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'line 1\nline 2\nline 3'}]

## content.special.csl_like

### Content containing <--- markers

- parse('<---WRITE file="test.txt"--->
This looks like <---WRITE---> but is just content
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'This looks like <---WRITE---> but is just content'}]

- parse('<---WRITE file="test.txt"--->
<---NOT-A-VALID-MARKER--->
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: '<---NOT-A-VALID-MARKER--->'}]

## content.special.trailing_newlines

### Blank lines before END

- parse('<---WRITE file="test.txt"--->
content

<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n'}]

- parse('<---WRITE file="test.txt"--->
content


<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n\n'}]

## content.special.line_endings

### CRLF/LF/CR normalization

- parse('<---WRITE file="test.txt"--->\r\ncontent\r\n<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]

- parse('<---WRITE file="test.txt"--->\r\ncontent\r\n\r\n<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n'}]

- parse('<---WRITE file="test.txt"--->\rcontent\r<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]

## state_machine.valid.sequences

### Valid operation orders

- parse('<---WRITE file="test1.txt"--->
content1
<---END--->
<---WRITE file="test2.txt"--->
content2
<---END--->') 
→ [
    {type: 'WRITE', line: 1, file: 'test1.txt', content: 'content1'},
    {type: 'WRITE', line: 4, file: 'test2.txt', content: 'content2'}
]

## state_machine.valid.search_flow

### SEARCH → TO → REPLACE → END

- parse('<---SEARCH file="test.py"--->
pattern
<---TO--->
end_pattern
<---REPLACE--->
replacement
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'test.py', pattern: 'pattern', to: 'end_pattern', replacement: 'replacement'}]

- parse('<---SEARCH file="test.js"--->
pattern
<---REPLACE--->
replacement
<---END--->') 
→ [{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'pattern', replacement: 'replacement'}]

## state_machine.valid.tasks_context

### State changes in TASKS

- parse('<---TASKS--->
<---WRITE file="test.txt"--->
content
<---END--->
<---RUN--->
echo done
<---END--->
<---END--->') 
→ [{type: 'TASKS', line: 1, operations: [
    {type: 'WRITE', line: 2, file: 'test.txt', content: 'content'},
    {type: 'RUN', line: 5, content: 'echo done'}
]}]

## state_machine.invalid.wrong_marker

### Invalid marker for state

- parse('<---WRITE file="test.txt"--->
<---REPLACE--->
invalid
<---END--->') 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: '<---REPLACE--->\ninvalid'}]

- parse('<---RUN--->
<---TO--->
invalid
<---END--->') 
→ [{type: 'RUN', line: 1, content: '<---TO--->\ninvalid'}]

## state_machine.invalid.missing_end

### Unterminated operations

- parse('<---WRITE file="test.txt"--->
content') 
→ Error("Line 1: Unterminated WRITE operation")

- parse('<---SEARCH file="test.js"--->
pattern
<---REPLACE--->
replacement') 
→ Error("Line 1: Unterminated SEARCH operation")

## state_machine.invalid.nested_tasks

### TASKS inside TASKS

- parse('<---TASKS--->
<---TASKS--->
<---END--->
<---END--->') 
→ Error("Line 2: TASKS cannot be nested")

## parse_errors.malformed.incomplete

### <-- or ---> alone

- parse('<---WRITE file="test.txt"-->
content
<---END--->') 
→ Error("Line 1: Malformed marker")


## parse_errors.malformed.invalid_line_start

### Lines starting with <--- must be valid markers

- parse('<---this is not a valid marker
content
<---END--->') 
→ Error("Line 1: Malformed marker")

- parse('<---
content
<---END--->') 
→ Error("Line 1: Malformed marker")

## parse_errors.malformed.unknown_ops

### <---INVALID--->

- parse('<---INVALID--->
content
<---END--->') 
→ Error("Line 1: Unknown operation: INVALID")

- parse('<---UNKNOWN file="test.txt"--->
content
<---END--->') 
→ Error("Line 1: Unknown operation: UNKNOWN")

## parse_errors.malformed.case_sensitive

### Operations must be uppercase

- parse('<---write file="test.txt"--->
content
<---END--->') 
→ Error("Line 1: Unknown operation: write")

- parse('<---Write file="test.txt"--->
content
<---END--->') 
→ Error("Line 1: Unknown operation: Write")

- parse('<---TASKS--->
<---run--->
echo test
<---END--->
<---END--->') 
→ Error("Line 2: Unknown operation: run")

## parse_errors.structural.unterminated

### Missing END

- parse('<---WRITE file="test.txt"--->
content
<---WRITE file="test2.txt"--->') 
→ Error("Line 1: Unterminated WRITE operation")

## parse_errors.structural.content_on_marker

### <---END---> extra text

- parse('<---WRITE file="test.txt"--->
content
<---END---> extra text') 
→ Error("Line 3: Content not allowed on marker line")

## parse_errors.structural.end_with_attributes

### END markers cannot have attributes

- parse('<---WRITE file="test.txt"--->
content
<---END attr="value"--->') 
→ Error("Line 3: END marker cannot have attributes")

- parse('<---RUN--->
echo test
<---END debug="true"--->') 
→ Error("Line 3: END marker cannot have attributes")

- parse('<---WRITE file="test.txt"---> inline content
more content
<---END--->') 
→ Error("Line 1: Content not allowed on marker line")

## options.custom_delimiters

### Using custom start/end delimiters

- parse('@[[[[WRITE file="test.txt"]]]]@
content
@[[[[END]]]]@', {startDelimiter: '@[[[[', endDelimiter: ']]]]@'}) 
→ [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]

- parse('@[[[[TASKS]]]]@
@[[[[RUN]]]]@
echo test
@[[[[END]]]]@
@[[[[END]]]]@', {startDelimiter: '@[[[[', endDelimiter: ']]]]@'}) 
→ [{type: 'TASKS', line: 1, operations: [
    {type: 'RUN', line: 2, content: 'echo test'}
]}]

- parse('@[[[[SEARCH file="config.json"]]]]@
"debug": false
@[[[[REPLACE]]]]@
"debug": true
@[[[[END]]]]@', {startDelimiter: '@[[[[', endDelimiter: ']]]]@'}) 
→ [{type: 'SEARCH', line: 1, file: 'config.json', pattern: '"debug": false', replacement: '"debug": true'}]