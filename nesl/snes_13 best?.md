# NESL - NO escape Syntax Language Specification

NESL is a string-only data format with one operator (`=`) and type indicators that control value parsing.

## Type Indicators

- `:` - Trimmed string (removes leading/trailing whitespace)
- `<<<<R"""(` - Verbatim (v) Raw string (preserves ALL characters after `<<<<R"""(` including ALL leading and trailing whitespace) until the closing syntax `)""">>>>` which must be immediately followed by a newline
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

### Raw String (`<<<<R"""(` ... `)""">>>>`)
```
o1 = {
    a1 =<<<<R"""(/usr1:/"local"/bin      )""">>>>
    a2 =<<<<R"""(  /usr:/local/bin)""">>>>
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
    x =<<<<R"""(    )""">>>>
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

**Multi-line arrays**: ONLY raw strings (`<<<<R"""(`)
```
items = [
    <<<<R"""(apple)""">>>>
    <<<<R"""(banana  )""">>>>
]
```

**Inline arrays**: ONLY trimmed strings (`:`)
```
tags = [:dev, :staging, :prod]
```

### Multiline String (`(`)
Each line must start with `<<<<R"""(` and end with `)""">>>>` followed immediately by the newline or `EOF`. The `<<<<R"""(` and `)""">>>>` are stripped, content preserved, lines joined with `\n`.  no characters in the line are ever escaped
```
text = (
    <<<<R"""(Line 1)""">>>>
    <<<<R"""(   Line "2: indented)""">>>>
    <<<<R"""(    )""">>>>
)
```
Result: `Line 1\n   Line "2 indented\n    `

whitespace is preserved in blank raw strings too
blank lines not allowed in multiline strings

```
text = (
    <<<<R"""(  hohoho)""">>>>
    <<<<R"""(  lalala )""">>>>
)
```
Result: `"  hohoho\n  lalala "`

be sure to notice each whitespace char throughout raw strings

### More Examples

```
// Example E: multiline string with blank first/last lines
sdfg = (
    R"""|  |"""
    R"""| asdf grjeiog awef|"""
    R"""||"""
    R"""| gerg ergo wefw8uef  |"""
    R"""|  |"""
)
```

```json
{
    "sdfg": "  \n asdf grjeiog awef\n\n gerg ergo wefw8uef  \n  "
}
```
## Rules

1. Comments: Full-line only, start with `//`
2. Whitespace around `=` is cosmetic
3. All values are strings (type conversion is application-level)
4. No escape sequences
5. Arrays cannot mix formats (all inline or all multi-line)
6. Arrays cannot mix string types (all `:` or all `<<<<R"""(`)
7. Empty values allowed: `empty =: ` and `empty =:` produces `""` 
8. Nesting allowed to arbitrary depth

## Invalid Constructs

- Inline comments: `key =: value // comment`
- Mixed array formats: `[<<<<R"""(raw, :trim]`
- Trimmed strings in multi-line arrays: `[\n    :trim\n]`
- Raw strings in inline arrays: `[<<<<R"""(raw, <<<<R"""(raw2]`

## REMINDER

IMPORTANT!!!!

- be very careful to precisely preserve all whitespace at the start of raw strings
- never escape any characters ever

^^ IMPORTANT!!!!
------------------

generate a bunch of new unique random SNES examples each followed by equivalent json.  get increasingly weird with edge cases and whitespace etc.  use comments (no inline comments alowed tho)


and also  do these



// Example 2: Weird array elements (empty, spaces, colon prefix)
values = [
    <<<<R"""(first)""">>>>
    <<<<R"""()""">>>>
    <<<<R"""(   spaced   )""">>>>
    <<<<R"""(   raw:with:colons)""">>>>
]




// Example 7: Deeply nested weird formatting
a = {
    b = {
        c = [
            (
                <<<<R"""( first)""">>>>
                <<<<R"""()""">>>>
                <<<<R"""(second  )""">>>>
            )
        ]
    }
    z =: end
}

// Example E: multiline string with blank first/last lines
poem = (
    <<<<R"""(  )""">>>>
    <<<<R"""( Roses are red)""">>>>
    <<<<R"""()""">>>>
    <<<<R"""( Violets are blue  )""">>>>
    <<<<R"""(  )""">>>>
)

// Example E: multiline string with blank first/last lines
poem = (
    <<<<R"""(  )""">>>>
    <<<<R"""( One """more""" line)""">>>>
    <<<<R"""()""">>>>
    <<<<R"""( and  "yet)""">>>> another 'neat' """line"""  )""">>>>
    <<<<R"""(  )""">>>>
)


// Example 3: Empty array and empty values
empty =:
list = [ ]
data = {
    x =:
    y =<<<<R"""(  )""">>>>
}

and then format this as a single multiine nesl string attribute:

```
   "hi" (i said to "her)""">>>>. "we can't go there", she replied 
"oh its you". 
welll...
      summer was over.
"hey well lets go swimming".  """WHAT???!!!"""
```