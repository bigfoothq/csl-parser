


method =| tools/call
myvar =| simple string
asdfes =| some other string it gets trimmed remember and has char limitations
params = {
    name =::read_file -- this whole line is the value for name incluidng {}[], etc 
    path =::/path/with spaces/and[brackets].txt
    asdf =::whole line gets read, no trimming. commas allowd
}

ar = [
    ::el1
    ::el2
    | shouldthis be alowed
    | yes we should just mandate a space after the pipe cos it gets trimmed anyway
    ::is this too..., visually confusing tho?
    | i think it makes sense to mix pipes and double colon for formatting like unwrapping or compressing maybe
    (
        ::do we need 
        ::  double colon
        :: for each line like this
        |should this be allowed 
        | yes it just has to start with a space. i mean it doens't HAVE to.  but when beautified it will be added
    )
]

a2 [ |1, |hello here, |234, |one two , |2-29-84 ]