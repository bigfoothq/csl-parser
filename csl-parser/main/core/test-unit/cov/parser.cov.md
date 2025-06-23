20250122

# parser.cov.md

parse(text) → AST or throws Error

## Happy Path

### Basic Operations

parse(
<---WRITE file="test.txt"--->
hello world
<---END--->
) → [{type: 'WRITE', file: 'test.txt', content: 'hello world', line: 1}]

parse(
<---RUN--->
npm install
<---END--->
) → [{type: 'RUN', content: 'npm install', line: 1}]

parse(
<---WRITE file="log.txt" append="true"--->
new entry
<---END--->
) → [{type: 'WRITE', file: 'log.txt', append: 'true', content: 'new entry', line: 1}]

### Search Operations

parse(
<---SEARCH file="config.json"--->
"debug": false
<---REPLACE--->
"debug": true
<---END--->
) → [{type: 'SEARCH', file: 'config.json', pattern: '"debug": false', replacement: '"debug": true', line: 1}]

parse(
<---SEARCH file="main.py"--->
def old_func():
   pass
<---TO--->
   return None
<---REPLACE--->
def new_func():
   return 42
<---END--->
) → [{type: 'SEARCH', file: 'main.py', pattern: 'def old_func():\n    pass', to: '    return None', replacement: 'def new_func():\n    return 42', line: 1}]

parse(
<---SEARCH file="test.js" count="all"--->
foo
<---REPLACE--->
bar
<---END--->
) → [{type: 'SEARCH', file: 'test.js', count: 'all', pattern: 'foo', replacement: 'bar', line: 1}]

### TASKS

parse(
<---TASKS--->
<---WRITE file="a.txt"--->
content a
<---END--->
<---RUN--->
echo done
<---END--->
<---END--->
) → [{type: 'TASKS', operations: [{type: 'WRITE', file: 'a.txt', content: 'content a', line: 2}, {type: 'RUN', content: 'echo done', line: 5}], line: 1}]

## Error Cases

### Missing Required Attributes

parse(
<---WRITE--->
content
<---END--->
) → throws "Line 1: Missing required attribute: file"

parse(
<---SEARCH--->
pattern
<---REPLACE--->
new
<---END--->
) → throws "Line 1: Missing required attribute: file"

### Empty Content Violations

parse(
<---RUN--->
<---END--->
) → throws "Line 2: Empty RUN content"

parse(
<---SEARCH file="test.js"--->
<---REPLACE--->
replacement
<---END--->
) → throws "Line 2: Empty SEARCH pattern"

parse(
<---SEARCH file="test.js"--->
pattern
<---TO--->
<---REPLACE--->
replacement
<---END--->
) → throws "Line 4: Empty TO pattern"

### Invalid Operations/Markers

parse(
<---INVALID--->
<---END--->
) → throws "Line 1: Unknown operation: INVALID"

parse(
<--- WRITE file="test"--->
content
<---END--->
) → throws "Line 1: Invalid marker format"

### Structural Violations

parse(
<---WRITE file="test.txt"--->
unclosed
) → throws "Line 3: Unexpected end of input"

parse(
<---TASKS--->
<---TASKS--->
<---END--->
<---END--->
) → throws "Line 2: TASKS cannot be nested"

### Duplicate Attributes

parse(
<---WRITE file="a.txt" file="b.txt"--->
content
<---END--->
) → throws "Line 1: Duplicate attribute: file"

### Invalid Attribute Values

parse(
<---SEARCH file="test.js" count="invalid"--->
pattern
<---REPLACE--->
new
<---END--->
) → throws "Line 1: Invalid count value: invalid"

parse(
<---WRITE file="test.txt" append="yes"--->
content
<---END--->
) → throws "Line 1: Invalid append value: yes"

### Malformed Attribute Syntax

parse(
<---WRITE file=unquoted--->
content
<---END--->
) → throws "Line 1: Invalid marker format"

parse(
<---WRITE file="unterminated--->
content
<---END--->
) → throws "Line 1: Invalid marker format"

parse(
<---WRITE file='mismatched"--->
content
<---END--->
) → throws "Line 1: Invalid marker format"

## Edge Cases

### Attribute Escaping

parse(
<---WRITE file="test\"quote.txt"--->
content
<---END--->
) → [{type: 'WRITE', file: 'test"quote.txt', content: 'content', line: 1}]

parse(
<---WRITE file='test\'quote.txt'--->
content
<---END--->
) → [{type: 'WRITE', file: "test'quote.txt", content: 'content', line: 1}]

parse(
<---WRITE file="path\\with\\backslash"--->
content
<---END--->
) → [{type: 'WRITE', file: 'path\with\backslash', content: 'content', line: 1}]

### CSL Syntax in Content

parse(
<---WRITE file="nested.csl"--->
<---WRITE file="inner"--->
This is literal text
<---END--->
<---END--->
) → [{type: 'WRITE', file: 'nested.csl', content: '<---WRITE file="inner"--->\nThis is literal text\n<---END--->', line: 1}]

### Empty Values

parse(
<---WRITE file=""--->
content
<---END--->
) → [{type: 'WRITE', file: '', content: 'content', line: 1}]

parse(
<---SEARCH file="test.js"--->
pattern
<---REPLACE--->
<---END--->
) → [{type: 'SEARCH', file: 'test.js', pattern: 'pattern', replacement: '', line: 1}]

### Multiple Operations

parse(
<---WRITE file="a.txt"--->
first
<---END--->
<---WRITE file="b.txt"--->
second
<---END--->
) → [{type: 'WRITE', file: 'a.txt', content: 'first', line: 1}, {type: 'WRITE', file: 'b.txt', content: 'second', line: 4}]

### Whitespace Between Attributes

parse(
<---WRITE   file="a.txt"     append="true"--->
content
<---END--->
) → [{type: 'WRITE', file: 'a.txt', append: 'true', content: 'content', line: 1}]

### Attribute Values with Equals

parse(
<---WRITE file="query=param&x=y"--->
content
<---END--->
) → [{type: 'WRITE', file: 'query=param&x=y', content: 'content', line: 1}]

### Line Ending Preservation

parse(
<---WRITE file="test.txt"--->
hello world
<---END--->
) → [{type: 'WRITE', file: 'test.txt', content: 'hello world', line: 1}]

parse(
<---WRITE file="test.txt"--->
hello world

<---END--->
) → [{type: 'WRITE', file: 'test.txt', content: 'hello world\n', line: 1}]

parse(
<---WRITE file="test.txt"--->
line1
line2
line3
<---END--->
) → [{type: 'WRITE', file: 'test.txt', content: 'line1\nline2\nline3', line: 1}]
### Partial Markers in Content

parse(
<---WRITE file="test.txt"--->
This <-- is not --> a marker
<--- also not a marker
--->
<---END--->
) → [{type: 'WRITE', file: 'test.txt', content: 'This <-- is not --> a marker\n<--- also not a marker\n--->', line: 1}]

parse(
<---WRITE file="test.txt"--->
prefix <---END--->
<---END--->
) → throws "Line 2: Content on marker line"

parse(
<---WRITE file="test.txt"--->
<---END---> suffix
<---END--->
) → throws "Line 2: Content on marker line"

parse(
<---WRITE file="test.txt"--->
<---WRITE<---END--->
<---END--->
) → throws "Line 2: Content on marker line"

### Invalid Context Markers

parse(
<---TO--->
content
<---END--->
) → throws "Line 1: TO marker not valid outside SEARCH operation"

parse(
<---WRITE file="test.txt"--->
<---TO--->
<---END--->
) → throws "Line 2: TO not valid in WRITE operation"

parse(
<---SEARCH file="test.js"--->
pattern
<---TO--->
middle
<---TO--->
end
<---REPLACE--->
new
<---END--->
) → throws "Line 5: TO marker already seen"

parse(
<---SEARCH file="test.js"--->
pattern
<---REPLACE--->
new
<---TO--->
invalid
<---END--->
) → throws "Line 5: TO not valid after REPLACE"

### END Marker Attributes

parse(
<---WRITE file="test.txt"--->
content
<---END attr="value"--->
) → throws "Line 3: END marker cannot have attributes"

### Empty TASKS

parse(
<---TASKS--->
<---END--->
) → [{type: 'TASKS', operations: [], line: 1}]

### No Trailing Newline

parse(
<---WRITE file=\"test.txt\"--->
content<---END--->
) → throws "Line 2: Content on marker line"

### Marker Format Violations

parse(
<---WRITE file="test.txt" --->
content
<---END--->
) → throws "Line 1: Invalid marker format"

parse(
<---WRITE file="test.txt"--- >
content
<---END--->
) → throws "Line 1: Invalid marker format"

### Line Number Accuracy

parse(


<---WRITE file="test.txt"--->
content
<---END--->
) → [{type: 'WRITE', file: 'test.txt', content: 'content', line: 3}]

parse(
<---SEARCH file="test.js"--->
pattern
<---REPLACE--->
<---END--->
<---RUN--->
<---END--->
) → throws "Line 6: Empty RUN content"

### Mixed Content and Operations

parse(
random text here

<---WRITE file="test.txt"--->
content
<---END--->

more random text
) → [{type: 'WRITE', file: 'test.txt', content: 'content', line: 3}]

parse(
<---TASKS--->
some text before operations
<---WRITE file="a.txt"--->
content
<---END--->
text between operations
<---RUN--->
echo hi
<---END--->
text after operations
<---END--->
) → [{type: 'TASKS', operations: [{type: 'WRITE', file: 'a.txt', content: 'content', line: 3}, {type: 'RUN', content: 'echo hi', line: 7}], line: 1}]

parse(
text before
<---WRITE file="a.txt"--->
first
<---END--->
text between
<---WRITE file="b.txt"--->
second
<---END--->
text after
) → [{type: 'WRITE', file: 'a.txt', content: 'first', line: 2}, {type: 'WRITE', file: 'b.txt', content: 'second', line: 6}]

### Newline Handling

parse(
<---WRITE file="test.txt"--->
hello world

<---END--->
) → [{type: 'WRITE', file: 'test.txt', content: 'hello world\n', line: 1}]

parse(
<---WRITE file="test.txt"--->
hello world
<---END--->
) → [{type: 'WRITE', file: 'test.txt', content: 'hello world', line: 1}]

parse(
<---WRITE file="test.txt"--->
content<---END--->
) → throws "Line 2: Invalid marker format"


### Unusual Attribute Names

parse(
<---WRITE @file="test.txt"--->
content
<---END--->
) → [{type: 'WRITE', '@file': 'test.txt', content: 'content', line: 1}]

parse(
<---WRITE 123="test.txt"--->
content
<---END--->
) → [{type: 'WRITE', '123': 'test.txt', content: 'content', line: 1}]

parse(
<---WRITE file-name="test.txt"--->
content
<---END--->
) → [{type: 'WRITE', 'file-name': 'test.txt', content: 'content', line: 1}]

### State Violation Tests

parse(
<---REPLACE--->
replacement text
<---END--->
) → throws "Line 1: REPLACE marker not valid outside SEARCH operation"

parse(
<---WRITE file="test.txt"--->
content
<---REPLACE--->
invalid
<---END--->
) → throws "Line 3: REPLACE not valid in WRITE operation"

parse(
<---SEARCH file="test.js"--->
<---REPLACE--->
replacement
<---END--->
) → throws "Line 2: Empty SEARCH pattern"

### Attribute Whitespace Normalization

parse(
<---WRITE   file="a.txt"     append="true"--->
content
<---END--->
) → [{type: 'WRITE', file: 'a.txt', append: 'true', content: 'content', line: 1}]

parse(
<---SEARCH file="test.js"    count="all"--->
pattern
<---REPLACE--->
replacement
<---END--->
) → [{type: 'SEARCH', file: 'test.js', count: 'all', pattern: 'pattern', replacement: 'replacement', line: 1}]