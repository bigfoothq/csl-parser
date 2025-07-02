```md
# NESL Specification

## Syntax
- `<<————-name` - Start block
- `<<————-♦` - End block, followed by closing tag of block type($, ], or })
- `::-` - Inline string
- `::=` - Inline primitive
- `-` - String element/value
- `.` - String continuation only
- `=` - Primitive element (arrays only)
- `$` - String
- `[` - Array
- `{` - Object

## Key Rules
- **Each `-` or `=` IMMEDIATELY ENDS the previous array element and starts a NEW one**
- `.` can ONLY follow `-` or `.` lines
- Primitives (`=`) cannot have continuations

---

## Examples

### Basic Types
```nesl
<<————-name::-John Doe
<<————-age::=42
<<————-bio $
-Software developer
.Living in SF
.favorite phrase: "foo bar"
<<————-♦ $
```
```toml
name = "John Doe"
age = 42
bio = """Software developer
Living in SF
favorite phrase: "foo bar""""
```

### Arrays - Element Boundaries
```nesl
<<————-data [
-First string
 =42
-Multi-line
.continues here
.empty string 
.the above line is literal text like this one
=3.14
-
.New element after primitive with leading blank line
<<————-♦ ]
```
```toml
data = [
  "First string",
  42,
  """Multi-line
continues here
empty string 
the above line is literal text like this one""",
  3.14,
  "\nNew element after primitive"
]
```

### Arrays - Common Pattern
```nesl
<<————-items [
-Sugar
.brown, packed
-
-Eggs
-
-
-
=3
-Milk
.whole
<<————-♦ ]
```
```toml
items = [
  """Sugar
brown, packed""",
  $,
  "Eggs",
  "",
  "",
  "",
  3,
  """Milk
whole"""
]
```

### Objects with Nested Arrays
```nesl
<<————-config {
<<————-host::-localhost
<<————-port::=8080
<<————-features [
-auth
-cache
.with TTL
<<————-♦ ]
<<————-♦ }
```
```toml
[config]
host = "localhost"
port = 8080
features = [
  "auth",
  """cache
with TTL"""
]
```

### Complete Example
```nesl
<<————-recipe {
<<————-name::-Cookies
<<————-ingredients [
-2 cups flour
-
.1 cup sugar
.granulated
=350
-
.multi-line
.sparse
-grams chocolate
<<————-♦ ]
<<————-desc $
-this is a beautiful
.recipe you will love it 
.all of your friends will love it too
.they will be like "omg wow" and will 
.want more
<<————-♦ $
<<————-♦ }
```
```toml
[recipe]
name = "Cookies"
ingredients = [
  "2 cups flour",
  """
1 cup sugar
granulated""",
  350,
  "\nmulti-line\nsparse",
  "grams chocolate"
]
desc = """this is a beautiful
recipe you will love it 
all of your friends will love it too
they will be like "omg wow" and will 
want more"""
```


### Array Element Boundaries - Critical
```nesl
<<————-tracks [
-Song Title
.additional info
.more details
=180
-Next Song
<<————-♦ ]
```
```toml
tracks = [
  """Song Title
additional info
more details""",
  180,
  "Next Song"
]
```

**NOT:**
```toml
# WRONG interpretation:
tracks = [
  "Song Title",
  """additional info
more details""",
  180,
  "Next Song"
]
```

### invalid!

```nesl
<<————-tracks [
-asdf
=180
.lkji
<<————-♦ ]
```

ERROR!!! this is invalid! not allowed to have continuation line after a primitive element

### Sparse

<<————-sparse [
-
-
.
-gopher
.
-
.pasta movie
-
=99
-
.another continuation
-
-Final element
<<————-♦ ]
```toml
sparse = [
  "",
  "\n",
  "gopher\n",
  "\npasta movie",
  "",
  99,
  "\nanother continuation",
  "",
  "Final element"
]
```

### anonymous arrays and objects 

<<————- {
<<————-::attr1::note that objects and arrays dont have to have names
<<————- [
-1st 
-second 
-
-    fourth. note that whitespace before the nelm marker is ignored
<<————-♦ ]
<<————-♦ }


```

convert this following toml code to nesl:



```toml
[app]
name = "My Application"
version = 2.1
description = """A comprehensive app
with multiple features
and great performance"""
features = [
  """authentication
with OAuth2""",
  """caching
Redis-based
with TTL""",
  60,
  "\nlogging system",
  """database
PostgreSQL"""
]

[app.settings]
host = "localhost"
port = 8080
debug = true

[app.metadata]
authors = [
  """John Doe
john@example.com""",
  "Jane Smith"
]
tags = [
  "web",
  "api",
  "",
  "production"
]
notes = """Remember to update docs
before release

Check all tests"""
```