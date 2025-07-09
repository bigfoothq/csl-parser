# NESL1 Format Specification

NESL1 (No Escape Syntax Language 1) is a line-based format where each line is complete and independent.

`<![CDATA[` - preserve verbatim - line start-marker
`]]>` - line end-marker

## Basic Syntax

### Single-line values (no newlines allowed):
```
username = <![CDATA[alice_wonderland]]>
status = <![CDATA[  active  ]]>
empty = <![CDATA[]]>
nospace = <![CDATA["hi"]]>
space = <![CDATA[ "hey"]]>
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
  <![CDATA[Dear Alice,]]>
  <![CDATA[]]>
  <![CDATA[   Welcome """to""" "Wonderland"!]]>
  <![CDATA[Best regards,]]>
)
```
```json
{
  "message": "Dear Alice,\n\n   Welcome \"\"\"to\"\"\" \"Wonderland\"!\nBest regards,"
}
```

### String containing the markers internally, to preserve:
```
tricky = <![CDATA[one towo "three]]> four five]]>
sneaky = <![CDATA[asdf <![CDATA[dfg g3rgerg]]>lalala]]>
```
```json
{
  "tricky": "one towo \"three]]> four five",
  "sneaky": "asdf <![CDATA[dfg g3rgerg]]>lalala",
}
```

note: valid for a string to contain the line end-marker as internal content

### Objects and Arrays:
```
user = {
  name = <![CDATA[Alice]]>
  roles = [
    - <![CDATA[admin]]>
    - <![CDATA[ editor]]>
    - (
      <![CDATA[ line 1]]>
      <![CDATA[line 2]]>
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

1. The entire `<![CDATA[`...`]]>\n` must be on ONE line - no line breaks inside
2. Everything between `<![CDATA[` and `]]>\n` is literal (no escapes)
3. ALL whitespace is preserved exactly: `<![CDATA[  hi  ]]>\n` = "  hi  "
5. No escaping ever - `<![CDATA[C:\"path"\'file'.txt]]>\n` = `C:\"path"\'file'.txt`

## Complete Example

```
recipe = {
  name = <![CDATA[Chocolate Cake]]>
  servings = <![CDATA[8]]>
  instructions = (
    <![CDATA[ "1. Preheat <![CDATA[oven]]> to 350°F"]]>
    <![CDATA[   (that's important!)]]>
    <![CDATA[]]>
    <![CDATA[2. Mix ingredients:]]>
    <![CDATA[     - Flour]]>
    <![CDATA[     - Sugar]]>
  )
  tags = [
    - <![CDATA[dessert]]>
    - <![CDATA[ sweet ]]>
  ]
}
```
```json
{
  "recipe": {
    "name": "Chocolate Cake",
    "servings": "8",
    "instructions": " \"1. Preheat <![CDATA[oven]]> to 350°F\"\n   (that's important!)\n\n2. Mix ingredients:\n     - Flour\n     - Sugar",
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
   "hi" (i said to her]]>. "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      <![CDATA[summer ]]>was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
```


now convert these to JSON, one at a time:

reprint each of these right before you show the equivalent JSON

Example 7: Deeply nested weird formatting
```
a = {
  b = {
    c = [
      - (
        <![CDATA[ first]]>
        <![CDATA[]]>
        <![CDATA[second  ]]>
      )
    ]
  }
  z = <![CDATA[end]]>
}
```

Example 8: multiline string with blank first/last lines
```
poem = {
  poem = (
    <![CDATA[  ]]>
    <![CDATA[ Roses are red]]>
    <![CDATA[]]>
    <![CDATA[ Violets are blue  ]]>
    <![CDATA[  ]]>
  )
}
```

Example 9: multiline string with blank first/last lines
```
poem = {
  poem = (
    <![CDATA[  ]]>
    <![CDATA[ One """more""" line]]>
    <![CDATA[]]>
    <![CDATA[and  "yet)pv another 'neat' """line"""  ]]>
    <![CDATA[  ]]>
  )
}
```

Example 10: Empty array and empty values
```
root = {
  empty = <![CDATA[]]>
  list = []
  data = {
    x = <![CDATA[]]>
    y = <![CDATA[  ]]>
  }
}
```

**Remember** 
- preserve ALL chars including leading whitespace