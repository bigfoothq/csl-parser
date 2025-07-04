# SCONES Format Specification

SCONES (Simple Crumbed Obvious No Escape Syntax) is a configuration format where every line has a path prefix showing its exact location in the data structure.

## Core Rules

1. Every line starts with a path prefix (e.g., `__o.v__`)
2. Values use `R"""pv(...)pv"""` syntax - the entire wrapper MUST be on ONE SINGLE LINE (no newlines allowed inside. no line wrapping!)
3. If your text contains newlines, you MUST use multiline syntax
4. Everything inside `R"""pv(` and `)pv"""` is literal (no escapes, whitespace preserved exactly including leading/trailing spaces)
5. Arrays and multiline strings: each element/line gets its own wrapper
6. All values are literal strings (type conversion happens in your application)

## Path Prefix Components

- `__` - Separator between path segments
- `o` - Object
- `a` - Array  
- `v` - Value (key-value pair)
- `m` - Multiline string
- `i` - Item (array element or multiline line)

## Basic Structures

### Object with Values

**SCONES:**
```
__o__ config = {
__o.v__ host = R"""pv(localhost)pv"""
__o.v__ port = R"""pv(8080)pv"""
__o.v__ empty = R"""pv()pv"""
__o__ }
```

**JSON:**
```json
{
  "config": {
    "host": "localhost",
    "port": "8080",
    "empty": ""
  }
}
```

### Array

**SCONES:**
```
__o__ data = {
__o.a__ items = [
__o.a.i__ R"""pv(first)pv"""
__o.a.i__ R"""pv(   spaces preserved   )pv"""
__o.a.i__ R"""pv()pv"""
__o.a__ ]
__o__ }
```

**JSON:**
```json
{
  "data": {
    "items": ["first", "   spaces preserved   ", ""]
  }
}
```

### Multiline String

**SCONES:**
```
__o__ doc = {
__o.m__ text = (
__o.m.i__ R"""pv(Line one)pv"""
__o.m.i__ R"""pv(   Line two indented)pv"""
__o.m.i__ R"""pv()pv"""
__o.m.i__ R"""pv( Line four)pv"""
__o.m__ )
__o__ }
```

**JSON:**
```json
{
  "doc": {
    "text": "Line one\n   Line two indented\n\n Line four"
  }
}
```

## Nested Structures

### Objects in Arrays

**SCONES:**
```
__o__ users = {
__o.a__ list = [
__o.a.o__ {
__o.a.o.v__ name = R"""pv(Alice)pv"""
__o.a.o.v__ role = R"""pv(admin)pv"""
__o.a.o__ }
__o.a.o__ {
__o.a.o.v__ name = R"""pv( Bob)pv"""
__o.a.o.v__ role = R"""pv( user)pv"""
__o.a.o__ }
__o.a__ ]
__o__ }
```

**JSON:**
```json
{
  "users": {
    "list": [
      {"name": "Alice", "role": "admin"},
      {"name": " Bob", "role": " user"}
    ]
  }
}
```

### Deep Nesting

**SCONES:**
```
__o__ api = {
__o.o__ v1 = {
__o.o.a__ endpoints = [
__o.o.a.o__ {
__o.o.a.o.v__ path = R"""pv(/users)pv"""
__o.o.a.o.a__ methods = [
__o.o.a.o.a.i__ R"""pv(GET)pv"""
__o.o.a.o.a.i__ R"""pv(POST)pv"""
__o.o.a.o.a__ ]
__o.o.a.o__ }
__o.o.a__ ]
__o.o__ }
__o__ }
```

**JSON:**
```json
{
  "api": {
    "v1": {
      "endpoints": [
        {
          "path": "/users",
          "methods": ["GET", "POST"]
        }
      ]
    }
  }
}
```

## Special Characters

No escaping needed - everything is literal:

**SCONES:**
```
__o__ special = {
__o.v__ quotes = R"""pv(She said "Hello" and 'goodbye')pv"""
__o.v__ backslash = R"""pv(C:\Users\file.txt)pv"""
__o.v__ newline_text = R"""pv(This has \n in it)pv"""
__o.v__ json = R"""pv({"key": "value"})pv"""
__o__ }
```

**JSON:**
```json
{
  "special": {
    "quotes": "She said \"Hello\" and 'goodbye'",
    "backslash": "C:\\Users\\file.txt",
    "newline_text": "This has \\n in it",
    "json": "{\"key\": \"value\"}"
  }
}
```

## Key Points

1. **Path shows location**: `__o.a.o.v__` means: root object → array → object → value
2. **Whitespace preserved**: `R"""pv(   text   )pv"""` keeps all spaces
3. **Empty values**: Use `R"""pv()pv"""` for empty string
4. **Comments**: Full-line only, start with `//`
5. **Keys**: Everything before the first `=` is the key (no `=` allowed in keys)
6. **Closing syntax**: The `R"""pv(` and `)pv"""` markers must be exact

## Common Patterns

**Empty structures:**
- Empty object: `__o__ empty = { }` with closing `__o__ }`
- Empty array: `__o.a__ empty = [ ]` with closing `__o.a__ ]`
- Empty string: `__o.v__ empty = R"""pv()pv"""`

**Remember:**
- Every line needs its correct path prefix
- Never escape anything - it's all literal
- One array element per line
- Multiline strings join with `\n`


## REMINDER

IMPORTANT!!!!

- be very careful to precisely preserve all whitespace at the start of strings
- never escape any characters ever
- the string close delimiter is ONLY valid when at the END of the line!
- strings on single lines only

^^ IMPORTANT!!!!

###############################################################
###############################################################
###############################################################
###############################################################
###############################################################

INSTRUCTIOSN FOR YOU:

Hi, please format this as a single multiine SCONES string attribute:

```
   "hi" (i said to "her)pv. "we can't go there", she replied 
"oh its you". 
welll...
      summer was over.
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
