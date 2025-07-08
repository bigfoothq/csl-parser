# NESL1 Format Specification

NESL1 (No Escape Syntax Language 1) is a line-based format where each line is complete and independent.

`pv|` - "pv" stands for "preserve verbatim" - line start-marker

## Basic Syntax

### Single-line values (no newlines allowed):
```
username = pv|alice_wonderland
status = pv|  active  
empty = pv|
nospace = pv|"hi"
space = pv| "hey"
```
```json
{
  "username": "alice_wonderland",
  "status": "  active  ",
  "empty": "",
  "tricky": "one towo \"three)pv\"\"\" four five",
  "nospace": "\"hi\"",
  "sneaky": "asdf dfg g3rgerg)pv\"\"\" lalala",
  "space": " \"hey\"",
}
```

### Multiline text (for any text with newlines):
```
message = (
  pv|Dear Alice,
  pv|
  pv|   Welcome """to""" "Wonderland"!
  pv|Best regards,
)
```
```json
{
  "message": "Dear Alice,\n\n   Welcome \"\"\"to\"\"\" \"Wonderland\"!\nBest regards,"
}
```

### Objects and Arrays:
```
user = {
  name = pv|Alice
  roles = [
    - pv|admin
    - pv| editor
    - (
      pv| line 1
      pv|line 2
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

1. The entire string must be on ONE line after the line start-marker: `pv|` - no line breaks inside
2. Everything after `pv|` is literal (no escapes)
3. ALL whitespace is preserved exactly: `pv|  hi  \n` = "  hi  "
5. No escaping ever - `pv|C:\"path"\'file'.txt\n` = `C:\"path"\'file'.txt`

## Complete Example

```
recipe = {
  name = pv|Chocolate Cake
  servings = pv|8
  instructions = (
    pv| "1. Preheat oven to 350°F"
    pv|   (that's important!)
    pv|
    pv|2. Mix ingredients:
    pv|     - Flour
    pv|     - Sugar
  )
  tags = [
    - pv|dessert
    - pv| sweet 
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
- preserve every single char in the string immediately after the `pv|` marker including any leading whitespace




##################################################
##################################################
##################################################
##################################################
##################################################


INSTRUCTIOSN FOR YOU:

Hi, please format this as a single multiine NESL1 string attribute:

text block:
```
 "it was one of those pv|days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
"hey well lets go swimming".  """WHAT???!!!"""
```

 format this as a single multiine NESL1 string attribute:

text block:
```
   "hi" (i said to "her)pv""". pv|"we can't go there", she replied 
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
        pv| first
        pv|
        pv|second  
      )
    ]
  }
  z = pv|end
}
```

Example 8: multiline string with blank first/last lines
```
poem = {
  poem = (
    pv|  
    pv| Roses are red
    pv|
    pv| Violets are blue  
    pv|  
  )
}
```

Example 9: multiline string with blank first/last lines
```
poem = {
  poem = (
    pv|  
    pv| One """more""" line
    pv|
    pv|and  "yet)pv another 'neat' """line"""  
    pv|  
  )
}
```

Example 10: Empty array and empty values
```
root = {
  empty = pv|
  list = []
  data = {
    x = pv|
    y = pv|  
  }
}
```

 format this as a single multiine NESL1 string attribute:

text block:
```
   "hi" (i said to her)pv""". "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      pv|summer )pv"""was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
```

**Remember** 
for NESL1: 
- no escaping any chars ever
- preserve ALL chars!  even `pv|` and ALL whitespace

