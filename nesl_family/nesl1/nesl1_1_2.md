# NESL1 Format Specification

NESL1 (No Escape Syntax Language 1) is a line-based format where each line is complete and independent.

`R"""pv(` - "pv" stands for "preserve verbatim" - line start-marker
`)pv"""` - line end-marker

## Basic Syntax

### Single-line values (no newlines allowed):
```
username = R"""pv(alice_wonderland)pv"""
status = R"""pv(  active  )pv"""
empty = R"""pv()pv"""
nospace = R"""pv("hi")pv"""
space = R"""pv( "hey")pv"""
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
  R"""pv(Dear Alice,)pv"""
  R"""pv()pv"""
  R"""pv(   Welcome """to""" "Wonderland"!)pv"""
  R"""pv(Best regards,)pv"""
)
```
```json
{
  "message": "Dear Alice,\n\n   Welcome \"\"\"to\"\"\" \"Wonderland\"!\nBest regards,"
}
```

### String containing the end-line marker:
```
tricky = R"""pv(one towo "three)pv""" four five)pv"""
sneaky = R"""pv(asdf dfg g3rgerg)pv"""lalala)pv"""
```
```json
{
  "tricky": "one towo \"three)pv\"\"\" four five",
  "sneaky": "asdf dfg g3rgerg)pv\"\"\"lalala",
}
```

note: valid for a string to contain the line end-marker as internal content

### Objects and Arrays:
```
user = {
  name = R"""pv(Alice)pv"""
  roles = [
    - R"""pv(admin)pv"""
    - R"""pv( editor)pv"""
    - (
      R"""pv( line 1)pv"""
      R"""pv(line 2)pv"""
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

1. The entire `R"""pv(`...`)pv"""\n` must be on ONE line - no line breaks inside
2. Everything between `R"""pv(` and `)pv"""\n` is literal (no escapes)
3. ALL whitespace is preserved exactly: `R"""pv(  hi  )pv"""\n` = "  hi  "
5. No escaping ever - `R"""pv(C:\"path"\'file'.txt)pv"""\n` = `C:\"path"\'file'.txt`

## Complete Example

```
recipe = {
  name = R"""pv(Chocolate Cake)pv"""
  servings = R"""pv(8)pv"""
  instructions = (
    R"""pv( "1. Preheat oven to 350°F")pv"""
    R"""pv(   (that's important!))pv"""
    R"""pv()pv"""
    R"""pv(2. Mix ingredients:)pv"""
    R"""pv(     - Flour)pv"""
    R"""pv(     - Sugar)pv"""
  )
  tags = [
    - R"""pv(dessert)pv"""
    - R"""pv( sweet )pv"""
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

