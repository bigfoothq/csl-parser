
# CSL Parser Specification

CSL = 💚 Clada Syntax Language


start over.  see /Users/stuart/repos/csl-parser/potential_syntax_changes.txt

we need to be better this time about making the tag actually configurable.  every test needs to call it. or be configuratble.

and 


we're just going to outlaw writing or using code that contains our special CSL tag (at the start of a line anyway)

and when Clada is implementing the edit instructions, it should check every file and make sure there are no valid CSL syntax tags lying around.  if so it needs to explode and scream and abort. 

if fs needs to include the tags for some reason, they must have chars before them (whitespace, anything)

