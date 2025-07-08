note: fails in gfl sometimes. also fails in haiku3.5.  puts raw string syntax in inline arrays.  also never uses hyphen for arrayelement... allowing allthe quoting stuff maybe confusing it...
but opus 4 fails too... randomly wraps key names in quotes... 

# nesl4 Format Specification

nesl4 (No Escape Syntax Language 1) is a line-based format where each line is complete and independent.

`˘` line start-marker
`˘` line end-marker

these may NEVER be used for inline arrays or object definitions since they dont allow any escaping.

use normal double quotes, single quotes, or backticks for inline arrays or obejcts

ALL VALUES ARE STRINGS.  numeric or bool primitives ARE NOT SUPPORTED

## Basic Syntax

### Single-line values (no newlines allowed):
```
username = ˘alice_wonderland˘
status = ˘  act˘ive  ˘
empty = ˘˘
nospace = ˘"hi"˘
space = ˘ "hey"˘
```
```json
{
  "username": "alice_wonderland",
  "status": "  act˘ive  ",
  "empty": "",
  "nospace": "\"hi\"",
  "space": " \"hey\"",
}
```

### Multiline text (for any text with newlines):
```
message = (
  ˘Dear Alice,˘
  ˘˘
  ˘   Welcome """to""" "Wonderland"!˘
  ˘Best regards,˘
)
```
```json
{
  "message": "Dear Alice,\n\n   Welcome \"\"\"to\"\"\" \"Wonderland\"!\nBest regards,"
}
```

### String containing the end-line marker:
```
tricky = ˘one towo "three˘ four five˘
sneaky = ˘asdf dfg g3rgerg˘lalala˘
```
```json
{
  "tricky": "one towo \"three˘ four five",
  "sneaky": "asdf dfg g3rgerg˘lalala",
}
```

note: valid for a string to contain the line end-marker as internal content

### Objects and Arrays:
```
user = {
  name = ˘Alice˘
  age = ˘47˘
  roles = [
    - ˘admin˘
    - ˘ editor˘
    - (
      ˘ line 1˘
      ˘line 2˘
    )
  ]
}
```
```json
{
  "user": {
    "name": "Alice",
    "age": "47",
    "roles": ["admin", " editor", " line 1\nline 2"]
  }
}
```
note the use of hyphen to indicate array element line. 

### ", ', and ` normal escaping usage also supported for strings which allows inline strings

```
user = {
  name = `Alice`
  roles = ["admin", ' editor']
    - (
      " line 1"
      "line 2"
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


## Key Rules

1. The entire `˘`...`˘\n` must be on ONE line - no line breaks inside
2. Everything between `˘` and `˘\n` is literal (no escapes) (including other `˘` instances)
3. ALL whitespace is preserved exactly: `˘  hi˘  ˘\n` = "  hi˘  "
5. No escaping ever - `˘C:\"path"\'file'.txt˘\n` = `C:\"path"\'file'.txt`

## Complete Example

```
recipe = {
  name = ˘Chocolate Cake˘
  servings = ˘8˘
  instructions = (
    ˘ "1. Preheat oven to 350°F"˘
    ˘   (that's important!)˘
    ˘˘
    ˘2. Mix ingredients:˘
    ˘     - Flour˘
    ˘     - Sugar˘
  )
  tags = [
    - ˘dessert˘
    - ˘ sweet ˘
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

Hi, please format this as a single multiine nesl4 string attribute:

text block:
```
 "it ˘was˘ "one" of those days" she said 
     oh reaaaallllyyy 'not' !@#
"whatever" well
    ""okay"" if you say so
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
        ˘ first˘
        ˘˘
        ˘second  ˘
      )
    ]
  }
  z = ˘end˘
}
```

Example 8: multiline string with blank first/last lines
```
poem = {
  poem = (
    ˘  ˘
    ˘ Roses are red˘
    ˘˘
    ˘ Violets are blue  ˘
    ˘  ˘
  )
}
```

Example 9: multiline string with blank first/last lines
```
poem = {
  poem = (
    ˘  ˘
    ˘ One """more""" line˘
    ˘˘
    ˘and  "yet)pv another 'neat' """line"""  ˘
    ˘  ˘
  )
}
```

Example 10: Empty array and empty values
```
root = {
  empty = ˘˘
  list = []
  data = {
    x = ˘˘
    y = ˘  ˘
  }
}
```

 format this as a single multiine nesl4 string attribute:

text block:
```
   "hi" (˘i˘ ˘said to her˘. "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      ˘summer ˘was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
```
