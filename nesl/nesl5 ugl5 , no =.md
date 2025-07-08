
var1 :here's the value for this trim-string   //inline comment
var2 |here's the value for this raw string which allows commas, brackets, and braces, and `//` the inline comment symbol
arv1 [:one, :two, :three, :la la la]      //inline comment
asd3 |raw string example //this is not a comment since its part of the raw string that eats the whole line
* here is a whole-line comment
* comments starting with the * symbol can NEVER be inline comments
sdf
arv2 [
  -:one
  -:two
  -: spaces get trimmed they dont matter 
  -:but pob easier to read if starts no space in arrays like this
  -|especially for parallelism w raw strings like this
  -|so what if multiline strings
   |actually dont need any special multiline syntax
   |we just dont use the hypen again..., ?
  -:7th element here
]
var3 |maybe
     |we actually dont need any multiline string syntax at all?
     |we just detect continuing strings like thsi?
     :this could work in theory
     :i wonder if LLM could be smart enough to know that trim string means different thing 
     :in inline comment vs multiline string
     :we really need a no-comment raw string.... 
     !what about exclamation mark? // its a trim string that only ignores comment marker 
     !  so , {}[] are all allowed here and leading whitespace is preserved   //but this comment is not part of this line's string
     |spaces should be allowed, i mean blank lines. blank lines like w/o any pipe char get totally ignored

var4 |this line started with something besides a string line starter char so we know when var3 ended
obj1 { atr1 :the value}

* whole-line comment here, marked by `*` char

* could ':' mean something different depending on context? no that's prob too confusing for LLm or human
* cos trim string for obj attribute also needs to block commas 
obj2 {atr1 :a value, atr2 :another value }

* brings up the point of like... what if someone forgets a comma? claude would say that's a "footgun"...
* i dont think it matters. 
/**
block comment
we shouldnt sacrifice intelligence for extra safeguards
**/

obj3 {atr1 :here is a footgun-looking string atr2: that's really not. this is all part of `atr1` bc no commas anywhere }
obj4 {
  asdf |so the only illegal chars in trim strings are these: ,]}
  dfgdfg: there's really no technical reason to forbid these chars so we'll keep them legal: [{
  dfgfd  |but i'm wondering something now... commas are so common in text. what if semicolons were used to separate values instead of commas? no thats a bad idea. just use raw string. or rare string `!`
  
  obb { at1: 8, at2: 9, at3: last attribute, }
  ob34 {at4:here's value, sdf: another, gdrfg=:last one}
  obb { at1: 8, at2: 9, at3: last attribute,}
  ob34 {at4:here's value, sdf: another, gdrfg=:last one}

  //vs

  ar [:one, :two, :three]


  ar [:one, :two, :three]

  ar [:one, :two, :three]

* ≤≥¯,≥>,
}
\\what if our comments were like this? maybe LLMs could learn this symbols as the one that is NEVER allowd to be inline? no haiku still screws up. no that doens't fix anything.  big LLMs are good at avoiding inline comments.  but our thing is that we DO wnat inline comments... just not with RAW strings. we should just use normal // comments. oh but the point is to keep trainig data clean.... so dumb LLMs in the future dont get confused... that feels like "beyond the scope"... and what would exactly be the point? the point is for nesl2, nesl3, and nesl4.  the versions that have whole-line comments ONLY. bc theres currenly no symbol in code that means and always means WHOLE LINE ONLY COMMENT.  

* UPDATE okay actually these seem to be commonly trained things for whole-line-only comments:
* whole line comment 
c whole line comment 