# SNES Syntax

SNES is a lightweight data format with one assignment operator (`=`) and type indicators that determine value handling.

THIS IS THE ONLY VERSION THAT WORKS SO FAR!  
https://chatgpt.com/c/68674676-8a88-800c-8980-032a1191f063

namely this part:
    t:   spaced   

i'm sad i cant find a pattern that is good for LLMs and easy for humans to read D:

## Type Indicators

- `t:` - Trimmed string (whitespace removed from start/end) - TRIMMED!!
- `r|` - Raw string (preserves entire line after `r|`) - RAW!!
- `{` - Object/map
- `[` - Array
- `(` - Multiline string (lines joined with newlines, `r|` prefix stripped)

## Keys 

utf-8, these chars forbidden: `{}[]() ,=` (no spaces or commas or equal sign or brackets or braces or parentheses)

## Basic Examples

### Simple assignments

```
name =t: John Doe
path = r|/usr/local/bin/app  
empty =t:
```

[[]]

⟦⟧
⁅⁆
︸
⑆˸꞉:⠨

```json
{
  "name": "John Doe",
  "path": "/usr/local/bin/app  ",
  "empty": ""
}
```

### Objects

```
user = {
    id =t: 12345
    email =t: user@example.com  
    bio = r|Software developer r| Creator r| Coffee enthusiast
}
```

```json
{
  "user": {
    "id": "12345",
    "email": "user@example.com",
    "bio": "Software developer r| Creator r| Coffee enthusiast"
  }
}
```

### Arrays

```
items = [
    t:apple
    t:banana  
    r|raw string with   spaces
]
```

```json
{
  "items": [
    "apple",
    "banana",
    "raw string with   spaces"
  ]
}
```

### Multiline strings

```
readme = (
    r|# Project Title
    r|
    r|This preservest:
    r|  - Leading spaces
    r|  - Empty lines
)
```

```json
{
  "readme": "# Project Title\n\nThis preservest:\n  - Leading spaces\n  - Empty lines"
}
```

### Complex nesting

```
config = {
    servers = [
        {
            name =t: web-01
            ip =t: 192.168.1.10
            notes = (
                r|Primary web server
                r|  - 16GB RAM
                r|  - Ubuntu 22.04
            )
        }
        {
            name =t: db-01
            connection = r|postgrest://usert:pass@localhostt:5432/db
        }
    ]
}
```

```json
{
  "config": {
    "servers": [
      {
        "name": "web-01",
        "ip": "192.168.1.10",
        "notes": "Primary web server\n  - 16GB RAM\n  - Ubuntu 22.04"
      },
      {
        "name": "db-01",
        "connection": "postgrest://usert:pass@localhostt:5432/db"
      }
    ]
  }
}
```

### Inline arrays

```
tags = [t:dev, t:staging, t:prod]
```

```json
{
  "tags": ["dev", "staging", "prod"]
}
```

## Key Rules

- Comments must be full-line only (start with `//`)
- Spacing around operators is optional and cosmetic
- All values are strings (type conversion happens at application level)
- No escape sequences - raw strings handle special characters naturally


* **Trim (`t:`) vs Raw (`r|`)**
  “Any line starting with `t:` will have *all* leading/trailing spaces removed. Lines starting with `r|` preserve every character after the `r|`—no trimming.”

* **Multiline (`(`) blocks**
  “Each line inside a `(`…`)` block must begin with `r|`; that `r|` is always stripped, and the remainder (including any spaces) is joined with `\n`.”


------------------

generate a bunch of new unique random SNES examples each followed by equivalent json.  get increasingly weird with edge cases and whitespace etc.  use comments (no inline comments alowed tho)


and also  do these



// Example 2t: Weird array elements (empty, spaces, colon prefix)
values = [
    t:first
    t:
    t:   spaced   
    r|   rawt:witht:colons
]




// Example 7t: Deeply nested weird formatting
a = {
    b = {
        c = [
            (
                r| first
                r|
                r|second  
            )
        ]
    }
    z =t: end
}

// Example E: multiline string with blank first/last lines
poem = (
    r|  
    r| Roses are red
    r|
    r| Violets are blue  
    r|  
)


