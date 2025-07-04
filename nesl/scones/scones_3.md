# SCONES Format Specification

SCONES (Simple Crumbed Obvious No Escape Syntax) is a line-based configuration format where every line shows its exact location in the data structure.

## Fundamental Principle
**SCONES is a line-based format. Each line must be complete. You cannot split values across multiple lines.**

## Core Syntax Rules

1. Every line starts with a path prefix showing its location (e.g., `__o.v__`)
2. All values must be wrapped in `R"""pv(...)pv"""` syntax
3. The entire `R"""pv(...)pv"""` wrapper must be on ONE line - no line breaks inside
4. If your text contains newlines, you MUST use multiline syntax (not single value syntax)
5. Everything inside `R"""pv(` and `)pv"""` is literal - no escapes, all whitespace preserved
6. The closing `)pv"""` must be the last thing on the line
7. All values are strings (type conversion happens in your application)

## Path Prefix Components

- `__` - Separator between path segments
- `o` - Object
- `a` - Array  
- `v` - Value (single-line key-value pair)
- `m` - Multiline string
- `i` - Item (array element or multiline line)

## Value Types

### 1. Single-Line Values
For text WITHOUT newlines:
```
__o.v__ key = R"""pv(your text here)pv"""
```
Examples:
```
__o.v__ name = R"""pv(John Doe)pv"""
__o.v__ empty = R"""pv()pv"""
__o.v__ spaces = R"""pv(   keep all spaces   )pv"""
```

### 2. Multiline Strings
For text WITH newlines - you MUST use this syntax:
```
__o.m__ key = (
__o.m.i__ R"""pv(first line)pv"""
__o.m.i__ R"""pv(second line)pv"""
__o.m.i__ R"""pv()pv"""
__o.m.i__ R"""pv(fourth line)pv"""
__o.m__ )
```
- Each line of text gets its own `__o.m.i__` line
- Empty lines become `R"""pv()pv"""`
- Lines join with `\n` between them

### 3. Objects
```
__o__ config = {
__o.v__ host = R"""pv(localhost)pv"""
__o.v__ port = R"""pv(8080)pv"""
__o__ }
```

### 4. Arrays
```
__o.a__ items = [
__o.a.i__ R"""pv(first)pv"""
__o.a.i__ R"""pv(second)pv"""
__o.a.i__ R"""pv(third)pv"""
__o.a__ ]
```

## Critical Examples

### WRONG - Trying to embed newline in single value:
```
__o.v__ text = R"""pv(Line one
Line two)pv"""
```

### RIGHT - Using multiline syntax:
```
__o.m__ text = (
__o.m.i__ R"""pv(Line one)pv"""
__o.m.i__ R"""pv(Line two)pv"""
__o.m__ )
```

### Example: Complex multiline text
**Input text:**
```
   "hi" (i said to "her)pv. "we can't go there", she replied 
"oh its you". 
welll...
      summer was over.
```

**SCONES format:**
```
__o.m__ story = (
__o.m.i__ R"""pv(   "hi" (i said to "her)pv. "we can't go there", she replied )pv"""
__o.m.i__ R"""pv("oh its you". )pv"""
__o.m.i__ R"""pv(welll...)pv"""
__o.m.i__ R"""pv(      summer was over.)pv"""
__o.m__ )
```

## Whitespace Preservation

ALL whitespace is preserved exactly as-is:
```
__o.v__ a = R"""pv(  text)pv"""     → "  text" (2 leading spaces)
__o.v__ b = R"""pv(text  )pv"""     → "text  " (2 trailing spaces)
__o.v__ c = R"""pv(  text  )pv"""   → "  text  " (2 spaces each side)
__o.v__ d = R"""pv( )pv"""          → " " (single space)
__o.v__ e = R"""pv()pv"""           → "" (empty string)
```

## Nested Structures

### Objects in Arrays
```
__o.a__ users = [
__o.a.o__ {
__o.a.o.v__ name = R"""pv(Alice)pv"""
__o.a.o.v__ age = R"""pv(30)pv"""
__o.a.o__ }
__o.a.o__ {
__o.a.o.v__ name = R"""pv(Bob)pv"""
__o.a.o.v__ age = R"""pv(25)pv"""
__o.a.o__ }
__o.a__ ]
```

### Deep Nesting
```
__o__ root = {
__o.o__ level1 = {
__o.o.a__ items = [
__o.o.a.o__ {
__o.o.a.o.v__ value = R"""pv(data)pv"""
__o.o.a.o__ }
__o.o.a__ ]
__o.o__ }
__o__ }
```

## Special Characters

No escaping needed - everything is literal:
```
__o.v__ quotes = R"""pv(She said "Hello" and 'goodbye')pv"""
__o.v__ marker = R"""pv(The end marker is )pv""")pv"""
__o.v__ path = R"""pv(C:\Users\file.txt)pv"""
__o.v__ literal = R"""pv(This \n is not a newline)pv"""
```

## Complete Examples

### Example 1: Configuration File
**SCONES:**
```
__o__ server = {
__o.v__ host = R"""pv(192.168.1.1)pv"""
__o.v__ port = R"""pv(8080)pv"""
__o.o__ ssl = {
__o.o.v__ enabled = R"""pv(true)pv"""
__o.o.v__ cert = R"""pv(/path/to/cert.pem)pv"""
__o.o__ }
__o.a__ allowed_methods = [
__o.a.i__ R"""pv(GET)pv"""
__o.a.i__ R"""pv(POST)pv"""
__o.a.i__ R"""pv(PUT)pv"""
__o.a__ ]
__o__ }
```

**Equivalent JSON:**
```json
{
  "server": {
    "host": "192.168.1.1",
    "port": "8080",
    "ssl": {
      "enabled": "true",
      "cert": "/path/to/cert.pem"
    },
    "allowed_methods": ["GET", "POST", "PUT"]
  }
}
```

### Example 2: Document with Multiline Text
**SCONES:**
```
__o__ document = {
__o.v__ title = R"""pv(My Document)pv"""
__o.m__ content = (
__o.m.i__ R"""pv(First paragraph here.)pv"""
__o.m.i__ R"""pv()pv"""
__o.m.i__ R"""pv(  Second paragraph indented.)pv"""
__o.m.i__ R"""pv(  With multiple lines.)pv"""
__o.m__ )
__o__ }
```

**Equivalent JSON:**
```json
{
  "document": {
    "title": "My Document",
    "content": "First paragraph here.\n\n  Second paragraph indented.\n  With multiple lines."
  }
}
```

## Conversion Checklist

When converting to SCONES:
1. Does your text contain newlines? → Use multiline syntax (`__o.m__`)
2. Is it a single line of text? → Use value syntax (`__o.v__`)
3. Is it a list of items? → Use array syntax (`__o.a__`)
4. Remember: Every `R"""pv(...)pv"""` must be complete on ONE line
5. Remember: Preserve ALL whitespace exactly as it appears

## Comments

Full-line comments only, starting with `//`:
```
// This is a comment
__o.v__ key = R"""pv(value)pv"""
// Another comment
```

## Key Takeaways

1. **One value per line** - never split `R"""pv(...)pv"""` across lines
2. **Newlines in text = multiline syntax** - no exceptions
3. **Whitespace is sacred** - preserved exactly as typed
4. **No escaping** - what you see is what you get
5. **Path shows structure** - `__o.a.o.v__` = object→array→object→value



##################################################
##################################################
##################################################
##################################################
##################################################


INSTRUCTIOSN FOR YOU:

Hi, please format this as a single multiine SCONES string attribute:

```
 "it was one of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
```

now convert these to JSON, one at a time:

reprint each of these right before you show the equivalent JSON


```
// Example 7: Deeply nested weird formatting
__o__ a = {
__o.o__ b = {
__o.o.a__ c = [
__o.o.a.m__ (
__o.o.a.m.i__ R"""pv( first)pv"""
__o.o.a.m.i__ R"""pv()pv"""
__o.o.a.m.i__ R"""pv(second  )pv"""
__o.o.a.m__ )
__o.o.a__ ]
__o.o__ }
__o.v__ z = R"""pv(end)pv"""
__o__ }
```

```
// Example 8: multiline string with blank first/last lines
__o__ poem = {
__o.m__ poem = (
__o.m.i__ R"""pv(  )pv"""
__o.m.i__ R"""pv( Roses are red)pv"""
__o.m.i__ R"""pv()pv"""
__o.m.i__ R"""pv( Violets are blue  )pv"""
__o.m.i__ R"""pv(  )pv"""
__o.m__ )
__o__ }
```

```
// Example 9: multiline string with blank first/last lines
__o__ poem = {
__o.m__ poem = (
__o.m.i__ R"""pv(  )pv"""
__o.m.i__ R"""pv( One """more""" line)pv"""
__o.m.i__ R"""pv()pv"""
__o.m.i__ R"""pv(and  "yet)pv another 'neat' """line"""  )pv"""
__o.m.i__ R"""pv(  )pv"""
__o.m__ )
__o__ }
```

```
// Example 10: Empty array and empty values
__o__ root = {
__o.v__ empty = R"""pv()pv"""
__o.a__ list = [
__o.a__ ]
__o.o__ data = {
__o.o.v__ x = R"""pv()pv"""
__o.o.v__ y = R"""pv(  )pv"""
__o.o__ }
__o__ }
```
