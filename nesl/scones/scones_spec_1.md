# SCONES - Simple Crumbed Obvious No Escape Syntax

SCONES is a configuration format designed for maximum clarity and ease of use by LLMs. Every value has an explicit path prefix showing its exact location in the data structure.

## Core Principles

1. **No escape sequences** - Everything is literal
2. **No implicit string processing** - No trimming, no transformations
3. **Explicit path prefixes** - Every line shows exactly where it belongs
4. **One array element per line** - No inline arrays
5. **All values are raw strings** - Using `R"""pv(...)pv"""` syntax

## Path Prefix Syntax

Every line starts with a path prefix showing its location:
- `__` - Path segment separator
- `o` - Object
- `a` - Array
- `v` - Value (key-value pair)
- `m` - Multiline string
- `i` - Item (array element or multiline string line)

Examples:
- `__o__` - Root object
- `__o.v__` - Value in root object
- `__o.a__` - Array in root object
- `__o.a.i__` - Item in array
- `__o.a.o__` - Object inside array
- `__o.a.o.v__` - Value inside object inside array

## Value Syntax

### Single-line Values
All values use the raw string syntax:
```
__o.v__ name = R"""pv(John Doe)pv"""
__o.v__ path = R"""pv(/usr/local/bin   )pv"""
__o.v__ empty = R"""pv()pv"""
```

### Objects
Objects are declared with their path, followed by `= {` and closed with `}`:
```
__o__ config = {
__o.v__ host = R"""pv(localhost)pv"""
__o.v__ port = R"""pv(8080)pv"""
__o__ }
```

### Arrays
Arrays are declared with their path, followed by `= [` and closed with `]`:
```
__o.a__ items = [
__o.a.i__ R"""pv(first item)pv"""
__o.a.i__ R"""pv(   second item with spaces   )pv"""
__o.a.i__ R"""pv()pv"""
__o.a__ ]
```

Arrays can contain objects:
```
__o.a__ users = [
__o.a.o__ {
__o.a.o.v__ name = R"""pv(Alice)pv"""
__o.a.o.v__ role = R"""pv(admin)pv"""
__o.a.o__ }
__o.a.o__ {
__o.a.o.v__ name = R"""pv(Bob)pv"""
__o.a.o.v__ role = R"""pv(user)pv"""
__o.a.o__ }
__o.a__ ]
```

### Multiline Strings
Multiline strings are declared with their path, followed by `= (` and closed with `)`:
```
__o.m__ message = (
__o.m.i__ R"""pv(First line)pv"""
__o.m.i__ R"""pv(   Second line with indent)pv"""
__o.m.i__ R"""pv()pv"""
__o.m.i__ R"""pv(Fourth line after blank)pv"""
__o.m__ )
```

## Rules

1. **Comments**: Full-line only, start with `//`
2. **No escape sequences**: Everything between `R"""pv(` and `)pv"""` is literal
3. **Path prefixes required**: Every line must have a proper path prefix
4. **Consistent structure**: Opening brackets/braces on same line as declaration, closing on separate line with matching prefix
5. **Whitespace preservation**: All whitespace inside `R"""pv(...)pv"""` is preserved exactly
6. **No inline arrays**: Every array element on its own line
7. **Empty values**: Represented as `R"""pv()pv"""`

## Examples

### Simple Configuration
```
__o__ server = {
__o.v__ host = R"""pv(0.0.0.0)pv"""
__o.v__ port = R"""pv(3000)pv"""
__o.o__ ssl = {
__o.o.v__ enabled = R"""pv(true)pv"""
__o.o.v__ cert = R"""pv(/etc/ssl/server.crt)pv"""
__o.o__ }
__o__ }
```

### Complex Nested Structure
```
// API configuration
__o__ api = {
__o.a__ endpoints = [
__o.a.o__ {
__o.a.o.v__ path = R"""pv(/api/v1/users)pv"""
__o.a.o.v__ method = R"""pv(GET)pv"""
__o.a.o.a__ middleware = [
__o.a.o.a.i__ R"""pv(authenticate)pv"""
__o.a.o.a.i__ R"""pv(rateLimit)pv"""
__o.a.o.a__ ]
__o.a.o.m__ description = (
__o.a.o.m.i__ R"""pv(Returns a list of users.)pv"""
__o.a.o.m.i__ R"""pv(   Requires authentication token.)pv"""
__o.a.o.m.i__ R"""pv()pv"""
__o.a.o.m.i__ R"""pv(Rate limited to 100 requests/hour.)pv"""
__o.a.o.m__ )
__o.a.o__ }
__o.a__ ]
__o__ }
```

### Edge Cases with Special Characters
```
__o__ weird = {
__o.v__ quotes = R"""pv(She said "hello" and he said 'goodbye')pv"""
__o.v__ path = R"""pv(C:\Users\John\Documents\file.txt)pv"""
__o.v__ regex = R"""pv(^[a-zA-Z0-9_]*$)pv"""
__o.v__ spaces = R"""pv(   lots   of   spaces   )pv"""
__o.v__ special = R"""pv(τ = 2π, © 2024, 你好)pv"""
__o.m__ code = (
__o.m.i__ R"""pv(if (x > 0) {)pv"""
__o.m.i__ R"""pv(    return "positive";)pv"""
__o.m.i__ R"""pv(})pv"""
__o.m__ )
__o__ }
```

## Invalid Constructs

- Missing path prefixes
- Inline arrays: `__o.a__ items = [R"""pv(one)pv""", R"""pv(two)pv"""]`
- Escape sequences: `\n`, `\"`, etc.
- Mixed prefix types: Using `__o.v__` for an array declaration
- Trimmed strings or colon syntax from NESL
- Keys with `=` in them (everything before first `=` is the key)

## Type Conversion

All values are strings. Type conversion (to numbers, booleans, etc.) is handled by the application consuming the configuration.