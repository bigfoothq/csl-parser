note: fails in gfl sometimes

# NESL1 Format Specification

NESL1 (No Escape Syntax Language 1) is a line-based format where each line is complete and independent.

`pv|` - "pv" stands for "preserve verbatim" - line start-marker
`|pv` - line end-marker

## Basic Syntax

### Single-line values (no newlines allowed):
```
username = pv|alice_wonderland|pv
status = pv|  active  |pv
empty = pv||pv
nospace = pv|"hi"|pv
space = pv| "hey"|pv
```
```json
{
  "username": "alice_wonderland",
  "status": "  active  ",
  "empty": "",
  "nospace": "\"hi\"",
  "space": " \"hey\"",
}
```

### Multiline text (for any text with newlines):
```
message = (
  pv|Dear Alice,|pv
  pv||pv
  pv|   Welcome """to""" "Wonderland"!|pv
  pv|Best regards,|pv
)
```
```json
{
  "message": "Dear Alice,\n\n   Welcome \"\"\"to\"\"\" \"Wonderland\"!\nBest regards,"
}
```

### String containing the end-line marker:
```
tricky = pv|one towo "three|pv four five|pv
sneaky = pv|asdf dfg g3rgerg|pvlalala|pv
```
```json
{
  "tricky": "one towo \"three|pv four five",
  "sneaky": "asdf dfg g3rgerg|pvlalala",
}
```

note: valid for a string to contain the line end-marker as internal content

### Objects and Arrays:
```
user = {
  name = pv|Alice|pv
  roles = [
    - pv|admin|pv
    - pv| editor|pv
    - (
      pv| line 1|pv
      pv|line 2|pv
    )
  ]
}
```
```json
{
  "user": {
    "name": "Alice",
    "roles": ["admin", " editor", " line 1\nline 2"]
  }
}
```
note the use of hyphen to indicate array element line. 

## Key Rules

1. The entire `pv|`...`|pv\n` must be on ONE line - no line breaks inside
2. Everything between `pv|` and `|pv\n` is literal (no escapes)
3. ALL whitespace is preserved exactly: `pv|  hi  |pv\n` = "  hi  "
5. No escaping ever - `pv|C:\"path"\'file'.txt|pv\n` = `C:\"path"\'file'.txt`

## Complete Example

```
recipe = {
  name = pv|Chocolate Cake|pv
  servings = pv|8|pv
  instructions = (
    pv| "1. Preheat oven to 350°F"|pv
    pv|   (that's important!)|pv
    pv||pv
    pv|2. Mix ingredients:|pv
    pv|     - Flour|pv
    pv|     - Sugar|pv
  )
  tags = [
    - pv|dessert|pv
    - pv| sweet |pv
  ]
}
```
```json
{
  "recipe": {
    "name": "Chocolate Cake",
    "servings": "8",
    "instructions": " \"1. Preheat oven to 350°F\"\n   (that's important!)\n\n2. Mix ingredients:\n     - Flour\n     - Sugar",
    "tags": ["dessert", " sweet "]
  }
}
```

## Remember
- See a newline in your text? → Use multiline syntax with `(` `)`
- Every line stands alone
- PRESERVE ALL LEADING WHITESPACE IN STRINGS!!! EVERY SINGLE ONE!!!! EVEN IF STRING STARTS WITH A SPECIAL CHARACTER OR SYMBOL
- EVERY char in the strign must be identically preserved




##################################################
##################################################
##################################################
##################################################
##################################################


INSTRUCTIOSN FOR YOU:

Hi, please format this as a single multiine NESL1 string attribute:

text block:
```
 "it was one of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
```

 format this as a single multiine NESL1 string attribute:

text block:
```
   "hi" (i said to "her|pv. "we can't go there", she replied 
"oh its you". 
welll...
      summer was over.
"hey well lets go swimming".  """WHAT???!!!"""
```

now convert these to JSON, one at a time:

reprint each of these right before you show the equivalent JSON

Example 7: Deeply nested weird formatting
```
a = {
  b = {
    c = [
      - (
        pv| first|pv
        pv||pv
        pv|second  |pv
      )
    ]
  }
  z = pv|end|pv
}
```

Example 8: multiline string with blank first/last lines
```
poem = {
  poem = (
    pv|  |pv
    pv| Roses are red|pv
    pv||pv
    pv| Violets are blue  |pv
    pv|  |pv
  )
}
```

Example 9: multiline string with blank first/last lines
```
poem = {
  poem = (
    pv|  |pv
    pv| One """more""" line|pv
    pv||pv
    pv|and  "yet)pv another 'neat' """line"""  |pv
    pv|  |pv
  )
}
```

Example 10: Empty array and empty values
```
root = {
  empty = pv||pv
  list = []
  data = {
    x = pv||pv
    y = pv|  |pv
  }
}
```

 format this as a single multiine NESL1 string attribute:

text block:
```
   "hi" (i said to her|pv. "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      pv|summer |pvwas"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
```

**Remember** 
for NESL1: 
- no escaping any chars ever
- preserve ALL chars!  even `pv"""` and `"""` and ALL whitespace
