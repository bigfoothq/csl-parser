
var1 =: here's the value for this trim-string
var2 = |here's the value for this raw string which allows commas, brackets, and braces
arv1 = [:one; :two; :three; :la la la]
arv2 = [
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
var3 = |maybe
       |we actually dont need any multiline string syntax at all?
       |we just detect continuing strings like thsi?
       :this could work in theory
       :i wonder if LLM could be smart enough to know that trim string means different thing 
       :in inline comment vs multiline string
       :we really need a no-comment raw string.... 
       !what about exclamation mark? // its a trim string that only ignores comment markers

       |spaces should be allowed, i mean blank lines. blank lines like w/o any pipe char get totally ignored

var4 = |this line started with something besides a string line starter char so we know when var3 ended
obj1 = { atr1 = :the value}

//could ':' mean something different depending on context? no that's prob too confusing for LLm or human
//cos trim string for obj attribute also needs to block commas 
obj2 = { atr1 = :a value; atr2 = :another value }

//brings up the point of like... what if someone forgets a comma? claude would say that's a "footgun"...
//i dont think it matters. 
/**
block comment
we shouldnt sacrifice intelligence for extra safeguards

obj3 = {atr1 = :here is a footgun-looking string atr2 =: that's really not. this is all part of `atr1` bc no commas anywhere }
obj4 = {
  asdf = |so the only illegal chars in trim strings are these: ,]}
  dfgdfg =: there's really no technical reason to forbid these chars so we'll keep them legal: [{
  dfgfd  = |but i'm wondering something now... commas are so common in text. what if semicolons were used to separate values instead of commas?
  
  obb = { at1 =: 8; at2 =: 9; at3 =: last attribute; }
  ob34 = {at4 =:here's value; sdf =: another; gdrfg=:last one}
  obb = { at1 =: 8; at2 =: 9; at3 =: last attribute;}
  ob34 = {at4 =:here's value; sdf =: another; gdrfg=:last one}

  //vs

  ar = [:one; :two; :three]


  ar = [:one, :two, :three]

  ar = [:one; :two; :three]

≤≥¯;≥>;
}