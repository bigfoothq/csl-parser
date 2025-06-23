# CSL Parser Integration Tests

Tests for the unified parse API that combines parsing and validation.

## Successful Parse and Validation

### Basic valid operation

- parse('<---WRITE file="test.txt"--->
content
<---END--->') 
→ {ast: [{type: "WRITE", line: 1, file: "test.txt", content: "content"}], validationErrors: []}

## Parse Error (Syntax)

### Unknown operation

- parse('<---INVALID--->
<---END--->') 
→ throws "Line 1: Unknown operation: INVALID"

### Malformed marker

- parse('<---WRITE') 
→ throws "Line 1: Malformed marker"

## Validation Errors (Semantic)

### Missing required attribute

- parse('<---WRITE--->
content
<---END--->') 
→ {ast: [{type: "WRITE", line: 1, content: "content"}], validationErrors: [{line: 1, operation: "WRITE", error: "Missing required attribute 'file'"}]}

### Empty RUN content

- parse('<---RUN--->
<---END--->') 
→ {ast: [{type: "RUN", line: 1, content: ""}], validationErrors: [{line: 1, operation: "RUN", error: "Empty content not allowed for RUN operation"}]}

## Multiple Operations with Mixed Validity

### Valid, invalid, valid sequence

- parse('<---WRITE file="a.txt"--->
ok
<---END--->
<---RUN--->
<---END--->
<---WRITE file="b.txt"--->
ok
<---END--->') 
→ {ast: [{type: "WRITE", line: 1, file: "a.txt", content: "ok"}, {type: "RUN", line: 4, content: ""}, {type: "WRITE", line: 6, file: "b.txt", content: "ok"}], validationErrors: [{line: 4, operation: "RUN", error: "Empty content not allowed for RUN operation"}]}

## TASKS with Nested Errors

### TASKS containing invalid operation

- parse('<---TASKS--->
<---WRITE file="ok.txt"--->
ok
<---END--->
<---RUN--->
<---END--->
<---END--->') 
→ {ast: [{type: "TASKS", line: 1, operations: [{type: "WRITE", line: 2, file: "ok.txt", content: "ok"}, {type: "RUN", line: 5, content: ""}]}], validationErrors: [{line: 5, operation: "RUN", error: "Empty content not allowed for RUN operation", parentTaskLine: 1}]}

## Complex Nested Validation

### Multiple TASKS blocks with different validation states

- parse('<---TASKS--->
<---WRITE file="ok.txt"--->
ok
<---END--->
<---END--->
<---TASKS--->
<---RUN--->
<---END--->
<---END--->') 
→ {ast: [{type: "TASKS", line: 1, operations: [{type: "WRITE", line: 2, file: "ok.txt", content: "ok"}]}, {type: "TASKS", line: 6, operations: [{type: "RUN", line: 7, content: ""}]}], validationErrors: [{line: 7, operation: "RUN", error: "Empty content not allowed for RUN operation", parentTaskLine: 6}]}