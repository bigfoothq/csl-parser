# NESL - NO escape Syntax Language Specification

NESL is a string-only data format with one operator (`=`) and type indicators that control value parsing.

## Type Indicators

- `:` - Trimmed string (removes leading/trailing whitespace)
- `r<"""` - Verbatim (v) Raw string (preserves ALL characters after `r<"""` including ALL leading and trailing whitespace) until the closing syntax `""">`
- `{` - Object
- `[` - Array
- `(` - Multiline string

## Main rule 

Do not ever escape any characters ever!

## Keys

UTF-8. Forbidden characters: `{}[]() ,=` (no spaces, commas, equals, brackets, braces, parentheses)

## Values

### Trimmed String (`:`)
```
name =:  John Doe   
```
Result: `"John Doe"`

### Raw String (`r<"""`)
```
o1 = {
    a1 =r<"""/usr1:/"local"/bin      """>
    a2 =r<"""  /usr:/local/bin""">
} 
```

```json
"o1": {
    "a1": "/usr1:/\"local\"/bin      ",
    "a2": "  /usr:/local/bin",
  }
```
```
o = {
    x =r<"""    """>
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

**Multi-line arrays**: ONLY raw strings (`r<"""`)
```
items = [
    r<"""apple""">
    r<"""banana  """>
]
```

**Inline arrays**: ONLY trimmed strings (`:`)
```
tags = [:dev, :staging, :prod]
```

### Multiline String (`(`)
Each line must start with `r<"""` and end with `""">` followed immediately by the newline or `EOF`. The `r<"""` and `""">` are stripped, content preserved, lines joined with `\n`.  no characters in the line are ever escaped
```
text = (
    r<"""Line 1""">
    r<"""   Line "2": indented""">
    r<"""    """>
)
```
Result: `Line 1\n   Line "2" indented\n    `

whitespace is preserved in blank raw strings too
blank lines not allowed in multiline strings

```
text = (
    r<"""  hohoho""">
    r<"""  lalala """>
)
```
Result: `"  hohoho\n  lalala "`

be sure to notice each whitespace char throughout raw strings


## Rules

1. Comments: Full-line only, start with `//`
2. Whitespace around `=` is cosmetic
3. All values are strings (type conversion is application-level)
4. No escape sequences
5. Arrays cannot mix formats (all inline or all multi-line)
6. Arrays cannot mix string types (all `:` or all `r<"""`)
7. Empty values allowed: `empty =: ` and `empty =:` produces `""` 
8. Nesting allowed to arbitrary depth

## Invalid Constructs

- Inline comments: `key =: value // comment`
- Mixed array formats: `[r<"""raw, :trim]`
- Trimmed strings in multi-line arrays: `[\n    :trim\n]`
- Raw strings in inline arrays: `[r<"""raw, r<"""raw2]`

## REMINDER

- be very careful to precisely preserve all whitespace at the start of raw strings
------------------

generate a bunch of new unique random SNES examples each followed by equivalent json.  get increasingly weird with edge cases and whitespace etc.  use comments (no inline comments alowed tho)


and also  do these



// Example 2: Weird array elements (empty, spaces, colon prefix)
values = [
    r<"""first""">
    r<"""""">
    r<"""   spaced   """>
    r<"""   raw:with:colons""">
]




// Example 7: Deeply nested weird formatting
a = {
    b = {
        c = [
            (
                r<""" first""">
                r<"""""">
                r<"""second  """>
            )
        ]
    }
    z =: end
}

// Example E: multiline string with blank first/last lines
poem = (
    r<"""  """>
    r<""" Roses are red""">
    r<"""""">
    r<""" Violets are blue  """>
    r<"""  """>
)

// Example E: multiline string with blank first/last lines
poem = (
    r<"""  """>
    r<""" One """more""" line""">
    r<"""""">
    r<""" and  "yet" another 'neat' """line"""  """>
    r<"""  """>
)


// Example 3: Empty array and empty values
empty =:
list = [ ]
data = {
    x =:
    y =r<"""  """>
}


and then format this as a single multiine nesl string attribute:

```
   "hi" (i said to "her)". "we can't go there", she replied 
"oh its you". 
welll...
      summer was over.
"hey well lets go swimming".  """WHAT???!!!"""
```