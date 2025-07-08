
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
   "hi" (i said to "her)pv""". "we can't go there", she replied 
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
      - R"""pv( first)pv"""
        R"""pv()pv"""
        R"""pv(second  )pv"""
    ]
  }
  z = R"""pv(end)pv"""
}
```

Example 8: multiline string with blank first/last lines
```
poem = {
  poem = 
    R"""pv(  )pv"""
    R"""pv( Roses are red)pv"""
    R"""pv()pv"""
    R"""pv( Violets are blue  )pv"""
    R"""pv(  )pv"""
}
```

Example 9: multiline string with blank first/last lines
```
poem = {
  poem = 
    R"""pv(  )pv"""
    R"""pv( One """more""" line)pv"""
    R"""pv()pv"""
    R"""pv(and  "yet)pv another 'neat' """line"""  )pv"""
    R"""pv(  )pv"""
}
```

Example 10: Empty array and empty values
```
root = {
  empty = R"""pv()pv"""
  list = []
  data = {
    x = R"""pv()pv"""
    y = R"""pv(  )pv"""
  }
}
```

 format this as a single multiine NESL1 string attribute:

text block:
```
   "hi" (i said to her)pv""". "we can't go there", she replied 
"oh ""its""" wowowowow!!! pv""" you". 
welll...
      R"""pv(summer )pv"""was"" over.
"hey well """lets"" "go )pv """pv(swimming".  """WHAT???!!!"""
```

**Remember** 
- no escaping any chars ever
- preserve ALL chars!  even `pv"""` and `"""` and ALL whitespace
