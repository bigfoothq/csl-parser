# SNES Syntax Specification

SNES is a string-only data format with one operator (`=`) and type indicators that control value parsing.

## Type Indicators

- `:` - Trimmed string (removes leading/trailing whitespace)
- `raw|` - Raw string (preserves all characters after `raw|`)
- `{` - Object
- `[` - Array
- `(` - Multiline string

## Keys

UTF-8. Forbidden characters: `{}[]() ,=` (no spaces, commas, equals, brackets, braces, parentheses)

## Values

### Trimmed String (`:`)
```
name =:  John Doe   
```
Result: `"John Doe"`

### Raw String (`raw|`)
```
path =  raw| /usr:/local/bin   
```
Result: `" /usr:/local/bin   "`

```
o = {
    x =raw|    
} 
```
Result: 
```json
"o": {
    "x": "    ",
  }
```

### Object (`{`)
```
user = {
    id =: 123
    email =: test@example.com
}
```

### Array (`[`)

**Multi-line arrays**: ONLY raw strings (`raw|`)
```
items = [
    raw|apple
    raw|banana  
]
```

**Inline arrays**: ONLY trimmed strings (`:`)
```
tags = [:dev, :staging, :prod]
```

### Multiline String (`(`)
Each line must start with `raw|`. The `raw|` is stripped, content preserved, lines joined with `\n`.
```
text = (
    raw|Line 1
    raw|  Line 2: indented
    raw|    
)
```
Result: `"Line 1\n  Line 2 indented\n    "`

whitespace is preserved in blank raw strings too

## Rules

1. Comments: Full-line only, start with `//`
2. Whitespace around `=` is cosmetic
3. All values are strings (type conversion is application-level)
4. No escape sequences
5. Arrays cannot mix formats (all inline or all multi-line)
6. Arrays cannot mix string types (all `:` or all `raw|`)
7. Empty values allowed: `empty =: ` and `empty =:` produces `""` 
8. Nesting allowed to arbitrary depth

## Invalid Constructs

- Inline comments: `key =: value // comment`
- Mixed array formats: `[raw|raw, :trim]`
- Trimmed strings in multi-line arrays: `[\n    :trim\n]`
- Raw strings in inline arrays: `[raw|raw, raw|raw2]`
------------------

generate a bunch of new unique random SNES examples each followed by equivalent json.  get increasingly weird with edge cases and whitespace etc.  use comments (no inline comments alowed tho)


and also  do these



// Example 2: Weird array elements (empty, spaces, colon prefix)
values = [
    raw|first
    raw|
    raw|   spaced   
    raw|   raw:with:colons
]




// Example 7: Deeply nested weird formatting
a = {
    b = {
        c = [
            (
                raw| first
                raw|
                raw|second  
            )
        ]
    }
    z =: end
}

// Example E: multiline string with blank first/last lines
poem = (
    raw|  
    raw| Roses are red
    raw|
    raw| Violets are blue  
    raw|  
)


// Example 3: Empty array and empty values
empty =:
list = [ ]
data = {
    x =:
    y =raw|  
}