# NESL - NO escape Syntax Language Specification

NESL is a string-only data format with one assignment operator (`=`) and type indicators that control value parsing.

## Type Indicators

- `:` - Trimmed string (removes leading/trailing whitespace)
- `R"""pv(` - pv for "preserve_verbatim" Raw string (preserves ALL characters after `R"""pv(` including ALL leading and trailing whitespace) until the closing syntax `)pv"""` which must be immediately followed by a newline
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

### Raw String (`R"""pv(` ... `)pv"""\n`)
```
o1 = {
    a1 =R"""pv(/usr1:/"local"/bin      )pv"""
    a2 =R"""pv(  /usr:/local/bin)pv"""
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
    x =R"""pv(    )pv"""
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

**Multi-line arrays**: ONLY raw strings (`R"""pv(`)
```
items = [
    R"""pv(apple)pv"""
    R"""pv(banana  )pv"""
]
```

**Inline arrays**: ONLY trimmed strings (`:`)
```
tags = [:dev, :staging, :prod]
```

### Multiline String (`(`)
Each line must start with `R"""pv(` and end with `)pv"""` followed immediately by the newline or `EOF`. The `R"""pv(` and `)pv"""` are stripped, content preserved, lines joined with `\n`.  no characters in the line are ever escaped.  if the closing delimiter (`)pv"""`) is found within the text and there are any chars after it, it is ignored.  closing delimiter is only valid at the very end of the line.


```
text = (
    R"""pv(Line 1)pv"""
    R"""pv(   Line "2: indented)pv"""
    R"""pv(    )pv"""
)
```
Result: `Line 1\n   Line "2 indented\n    `

whitespace is preserved in blank raw strings too
blank lines not allowed in multiline strings

```
text = (
    R"""pv(hohoho)pv"""
    R"""pv(lalala )pv"""
)
```
Result: `"hohoho\nlalala "`

be sure to notice each whitespace char throughout raw strings

### More Examples

```
// Example E: multiline string with blank first/last lines
sdfg = (
    R"""pv(  )pv"""
    R"""pv( asdf grjeiog awef)pv"""
    R"""pv()pv"""
    R"""pv( gerg ergo wefw8uef  )pv"""
    R"""pv(  )pv"""
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
6. Arrays cannot mix string types (all `:` or all `R"""pv(`)
7. Empty values allowed: `empty =: ` and `empty =:` produces `""` 
8. Nesting allowed to arbitrary depth

## Invalid Constructs

- Inline comments: `key =: value // comment`
- Mixed array formats: `[R"""pv(raw, :trim]`
- Trimmed strings in multi-line arrays: `[\n    :trim\n]`
- Raw strings in inline arrays: `[R"""pv(raw, R"""pv(raw2]`

## REMINDER

IMPORTANT!!!!

- be very careful to precisely preserve all whitespace at the start of raw strings
- never escape any characters ever
- the raw string closing delimiter is ONLY valid when at the END of the line!

^^ IMPORTANT!!!!
------------------

generate a bunch of new unique random SNES examples each followed by equivalent json.  get increasingly weird with edge cases and whitespace etc.  use comments (no inline comments alowed tho)


and also  do these



// Example 2: Weird array elements (empty, spaces, colon prefix)
values = [
    R"""pv(first)pv"""
    R"""pv()pv"""
    R"""pv(   spaced   )pv"""
    R"""pv(   raw:with:colons)pv"""
]




// Example 7: Deeply nested weird formatting
a = {
    b = {
        c = [
            (
                R"""pv( first)pv"""
                R"""pv()pv"""
                R"""pv(second  )pv"""
            )
        ]
    }
    z =: end
}

// Example E: multiline string with blank first/last lines
poem = (
    R"""pv(  )pv"""
    R"""pv( Roses are red)pv"""
    R"""pv()pv"""
    R"""pv( Violets are blue  )pv"""
    R"""pv(  )pv"""
)

// Example E: multiline string with blank first/last lines
poem = (
    R"""pv(  )pv"""
    R"""pv( One """more""" line)pv"""
    R"""pv()pv"""
    R"""pv(and  "yet)pv another 'neat' """line"""  )pv"""
    R"""pv(  )pv"""
)


// Example 3: Empty array and empty values
empty =:
list = [ ]
data = {
    x =:
    y =R"""pv(  )pv"""
}

and then format this as a single multiine nesl string attribute:

```
   "hi" (i said to "her)pv. "we can't go there", she replied 
"oh its you". 
welll...
      summer was over.
"hey well lets go swimming".  """WHAT???!!!"""
```