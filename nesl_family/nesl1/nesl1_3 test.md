
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