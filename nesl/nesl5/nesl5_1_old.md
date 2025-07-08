# NESL5 Syntax Guide

NESL5 is a configuration format where all values are strings. It uses three string types and clear structural markers.

## String Types

**`:` Trim String**
- Trims leading/trailing whitespace
- Stops at: `,` `]` `}` ` //`  (then trims trailing whitespace)
- Use in inline objects/arrays

**`¡` Comment-aware String**  
- Trims leading/trailing whitespace
- Includes: `,` `]` `}`
- Stops at: ` //` (then trims trailing whitespace)
- Use for complex strings outside objects/arrays

**`|` Raw String**
- Takes entire line as-is
- No inline comments possible
- Use for content with ` //` or when preserving exact formatting

## Structures

**Objects:** `{ key :value, key :value }`
**Arrays:** `[:item, :item]` or 

```
[
    -:item 
    -:item
]
```
(multiline)

**Comments:** 
- `*` whole-line only
- ` //` inline (except in raw strings)

NEVER USE `*` for inline comments

## Key Rules

1. In objects/arrays, only use `:` trim strings (or `|` raw strings if needed)
2. Never use `¡` strings inside objects/arrays (they eat commas)
3. Multiline strings: continue with same prefix on each line
4. Blank lines without prefix are ignored in multiline contexts

## Examples

### Basic Object
**NESL5:**
```
config {
  host :localhost
  port :8080
  path :/api/v2    // colons fine in trim strings
}
```
**JSON:**
```json
{"config": {"host": "localhost", "port": "8080", "path": "/api/v2"}}
```

### String Type Usage
**NESL5:**
```
* Showing when to use each string type
simple :hello world
complex ¡array[0] = func(a, b)    // needs comma support
raw This includes everything: // even comment markers, {braces}, etc.
```
**JSON:**
```json
{
  "simple": "hello world",
  "complex": "array[0] = func(a, b)",
  "raw": "This includes everything: // even comment markers, {braces}, etc."
}
```

### Nested Structure
**NESL5:**
```
user {
  name :Alice
  prefs {
    theme :dark
    notifications [:email, :sms]
  }
  * Raw string for bio with special content
  bio |Developer who uses // in code & {json} daily
}
```
**JSON:**
```json
{
  "user": {
    "name": "Alice",
    "prefs": {
      "theme": "dark",
      "notifications": ["email", "sms"]
    },
    "bio": "Developer who uses // in code & {json} daily"
  }
}
```

### Multiline Strings
**NESL5:**
```
message |Line one of the message 
        |Line two continues here   
        |Final line with exact spacing preserved 

description :   This is trimmed     
            : and continues here  
            :       with normalized spacing     
```
**JSON:**
```json
{
  "message": "Line one of the message \nLine two continues here   \nFinal line with exact spacing preserved ",
  "description": "This is trimmed\nand continues here\nwith normalized spacing"
}
```

### Array Variations
**NESL5:**
```
inline [:one, :two, :three]
multiline [
  -:first item
  -:second item  
  -{nested :object, type :example}
  -|raw string item with special chars: [,]
]
```
**JSON:**
```json
{
  "inline": ["one", "two", "three"],
  "multiline": [
    "first item",
    "second item",
    {"nested": "object", "type": "example"},
    "raw string item with special chars: [,]"
  ]
}
```

## Common Patterns

- Configuration values: Use `:` trim strings
- URLs, paths: Use `:` trim strings (special chars like `:/?&` are fine)
- User content with punctuation: Use `|` raw strings in objects
- Standalone text with punctuation: Use `¡` strings outside objects
- Code snippets, regexes: Use `|` raw strings

## Common Errors

### Missing Multiline Prefixes
The most common NESL5 error is forgetting to continue the string prefix on every line of a multiline string.

**WRONG:**
```
content |First line
Second line    // This becomes part of a malformed structure
Third line     // So does this
```

**CORRECT:**
```
content |First line
        |Second line
        |Third line
```

**Remember:** Every line of a multiline string MUST have the prefix (`|`, `:`, or `¡`). A multiline string ends when the parser encounters:
- A new variable declaration (e.g., `newvar :value`)
- End of file

Missing prefixes create parsing ambiguity and malformed data structures.

Add this to the specs:

**Empty Array Elements**: Empty strings in arrays must be explicitly marked with `:`. For example, `[:a, :, :b]` contains three elements where the second is an empty string. Writing `[:a, , :b]` is invalid syntax.

------------------------

generate some nesl5 examples with equivalent json, per each. not in artifact. fenced in code blocks

and then show me some more examples. include comments and multiline strings and arrays with empty string elements

