
//comments are only allowed on lines by themselves or after closing structural syntax like ), ], or }

//LLMs are strictly instructed to only use inline comments (even tho parser allows some inline comments like for colon-strings )

x1 :1        //this is technically a valid comment but LLMs should be told to never write inline comments
y1 :hello    //because they will get confused and try to put it on a whole-line string line
z1 :@#*&$*&@@${}|[]\)(


x |1   
y |hello  //this is not a comment! its part of the value for `y`!!! becuase `|` strings eat the whole line no matter what!
z |@#*&$*&@@${}|[]\)(

a [ 
    |element 1
    :element 2
    (
        |multiline element row1
        |multiline element row2
    ), :element 4, :element5
    |element six and this one contains commas, and brackets [] becuse its a pipe-string which eats the whole line
    :but this next element is a simple string which doens't allow those specific chars in elemnt6
    :asdf, :   this string gets trimmed   , :arga,:5465erteg,:fw8efu,:1,:2,:1,:!@#$%^&*this is valid simple stirng if u can believe it

    :missing lines is okay 
    |pipe stirng, whole line
    :last element. brackets not allowed so we can actually close the array on this line although its prob not a good idea really]

a2 [ :1, :hello here, :234, :one two , :2-29-84 ]    //comment
m (
    |m  is a multiline string var.  
    |here is a whole line 
    |  theis is line starting witha space
    | here is another whole line
    |last line
    |
    |above line is blank line
    |   
    |above line has some spaces
)
n (|this works too
       |whitespace before initial period doenstmatter
     | but closing parenthesis ()) must be on line by itself.  well it cant be part of a stirng.  
          |there could be somethign after it i guess
          )
p (|line1
|line2) q {var1 :value, var2: otherval} myvar :this is all valid, myvar2 : this is valid too
var5 : simple stirngs like this (created with `:`) cant have any of these chars: `,{}[]`

o {
    at1 : 1
    at2: 200
    at3   :  500, at6:hello heres the value for the last var, } //trailing commas alwas get ignored

//null values are not allowed




