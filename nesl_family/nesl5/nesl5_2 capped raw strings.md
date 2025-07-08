# NESL5 Syntax Guide

NESL5 is a configuration format where all values are strings. It uses three string types and clear structural markers.

## String Types

**`:` Trim String**
- Trims leading/trailing whitespace
- INVALID CHARS/STRINGS: `,` `]` `}` ` //`
  - any other chars or char sequences are fine
- Use in inline objects/arrays


**`|` Raw String**
- Takes entire line as-is, up to trailing `|` - the line-end marker
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



## Examples

### Basic Object
**NESL5:**
```
config {
  host :localhost
  port :8080
  path :/api:1/v2    // colons fine in trim strings
}
```
**JSON:**
```json
{"config": {"host": "localhost", "port": "8080", "path": "/api/v2"}}
```

### String Type Usage
**NESL5:**
```
// Showing when to use each string type
simple :hello world
complex |array[0] = func(a, b)|    // needs comma support. this is a valid comment since the raw string was capped before the comment
raw |This includes everything: // (comment markers), {braces}, etc.|
valid | this one contains pipes (|) which is fine. 2 pipes: ||, 3: ||||
CAS ¡ trims whitespace, allows every possible char (eg ,.<>[]\[}|...) except the comment str //this is a comment
```
**JSON:**
```json
{
  "simple": "hello world",
  "complex": "array[0] = func(a, b)",
  "raw": "This includes everything: // (comment markers), {braces}, etc.",
  "valid": " this one contains pipes (|) which is fine. 2 pipes: ||, 3: |||",
  "CAS": "trims whitespace, allows every possible char (eg ,.<>[]\[}|...) except the comment str"
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
  bio |Developer who uses // in code & {json} daily|
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
message |Line one of the message |          //valid comment
        |Line two continues here   |
        |Final line with exact spacing preserved |

description :   This is trimmed     
            : and continues here        //valid comment
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
  -{nested :object, type :example}              //valid comment
  -|raw string item with special chars: [,]|      //another valid comment
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
- Code snippets, regexes: Use `|` raw strings

## Common Errors

### Missing Multiline Prefixes
The most common NESL5 error is forgetting to continue the string prefix on every line of a multiline string.

**WRONG:**
```
content |First line|
Second line    // This becomes part of a malformed structure
Third line     // So does this
```

**CORRECT:**
```
content |First line|
        |Second line|
        |Third line|
```

**Remember:** Every line of a multiline string MUST have the prefix (`|` or `:`). A multiline string ends when the parser encounters:
- A new variable declaration (e.g., `newvar :value`)
- End of file
- 

Missing prefixes create parsing ambiguity and malformed data structures.

Blank lines without prefix are ignored in multiline contexts

**Empty Array Elements**: Empty strings in arrays must be explicitly marked with `:`. For example, `[:a, :, :b]` contains three elements where the second is an empty string. Writing `[:a, , :b]` is invalid syntax.

pipe stirngs are not allowed in inline arrays
