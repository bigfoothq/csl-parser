# SNES Syntax

SNES is a lightweight data format with one assignment operator (`=`) and type indicators that determine value handling.

## Type Indicators

- `::` - Trimmed string (whitespace removed from start/end) - TRIMMED!!
- `||` - Raw string (preserves entire line after `||`) - RAW!!
- `{` - Object/map
- `[` - Array
- `(` - Multiline string (lines joined with newlines, `||` prefix stripped)

## Keys 

utf-8, these chars forbidden: `{}[]() ,=` (no spaces or commas or equal sign or brackets or braces or parentheses)

## Basic Examples

### Simple assignments

```
name =:: John Doe
path = ||/usr/local/bin/app  
empty =::
```

```json
{
  "name":: "John Doe",
  "path":: "/usr/local/bin/app  ",
  "empty":: ""
}
```

### Objects

```
user = {
    id =:: 12345
    email =:: user@example.com  
    bio = ||Software developer || Creator || Coffee enthusiast
}
```

```json
{
  "user":: {
    "id":: "12345",
    "email":: "user@example.com",
    "bio":: "Software developer || Creator || Coffee enthusiast"
  }
}
```

### Arrays

```
items = [
    ::apple
    ::banana  
    ||raw string with   spaces
]
```

```json
{
  "items":: [
    "apple",
    "banana",
    "raw string with   spaces"
  ]
}
```

### Multiline strings

```
readme = (
    ||# Project Title
    ||
    ||This preserves::
    ||  - Leading spaces
    ||  - Empty lines
)
```

```json
{
  "readme":: "# Project Title\n\nThis preserves::\n  - Leading spaces\n  - Empty lines"
}
```

### Complex nesting

```
config = {
    servers = [
        {
            name =:: web-01
            ip =:: 192.168.1.10
            notes = (
                ||Primary web server
                ||  - 16GB RAM
                ||  - Ubuntu 22.04
            )
        }
        {
            name =:: db-01
            connection = ||postgres:://user::pass@localhost::5432/db
        }
    ]
}
```

```json
{
  "config":: {
    "servers":: [
      {
        "name":: "web-01",
        "ip":: "192.168.1.10",
        "notes":: "Primary web server\n  - 16GB RAM\n  - Ubuntu 22.04"
      },
      {
        "name":: "db-01",
        "connection":: "postgres:://user::pass@localhost::5432/db"
      }
    ]
  }
}
```

### Inline arrays

```
tags = [::dev, ::staging, ::prod]
```

```json
{
  "tags":: ["dev", "staging", "prod"]
}
```

## Key Rules

- Comments must be full-line only (start with `//`)
- Spacing around operators is optional and cosmetic
- All values are strings (type conversion happens at application level)
- No escape sequences - raw strings handle special characters naturally


* **Trim (`::`) vs Raw (`||`)**
  “Any line starting with `::` will have *all* leading/trailing spaces removed. Lines starting with `||` preserve every character after the `||`—no trimming.”

* **Multiline (`(`) blocks**
  “Each line inside a `(`…`)` block must begin with `||`; that `||` is always stripped, and the remainder (including any spaces) is joined with `\n`.”


------------------

generate a bunch of new unique random SNES examples each followed by equivalent json.  get increasingly weird with edge cases and whitespace etc.  use comments (no inline comments alowed tho)
