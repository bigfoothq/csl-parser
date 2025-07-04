


method =: tools/call
myvar =: simple string
asdfes =: some other string it gets trimmed remember and has char limitations
full_l = |no space after the syntax cos this eats the whole line with no trimming
asdfes =: some other string it gets trimmed remember and has char limitations
params = {
    name = |read_file — this whole line is the value for name incluidng {}[], etc 
    path = |/path/with spaces/and[brackets].txt
    asdf = |whole line gets read, no trimming. commas allowd
}

//no inline comments!  full line ocmments only
   // whitespace before comment is fine
ar = [
    |el1
    |el2
    :shouldthis be alowed
    :yes we should just mandate a space after the pipe cos it gets trimmed anyway
    |is this too..., visually confusing tho?
    :i think it makes sense to mix pipes and double colon for formatting like unwrapping or compressing maybe
    (
        |this is a multiline string
        |do we need 
        |  double colon
        |for each line like this
        :should this be allowed 
        :yes 
    )
]


// note we sholdn't use spaces after : in inline arrays cos it woul dbe too cluttered.  
// i mean we never NEED space after the :, we just usually add for visual ease
a2 [ :1, :hello here, :234, :one two , :2-29-84 ]




method=:tools/call
myvar=:simple string
asdfes=:some other string it gets trimmed remember and has char limitations
full_l=|no space after the syntax cos this eats the whole line with no trimming
asdfes=:some other string it gets trimmed remember and has char limitations
params={
    name=|read_file — this whole line is the value for name incluidng {}[], etc 
    path=|/path/with spaces/and[brackets].txt
    asdf=|whole line gets read, no trimming. commas allowd
}