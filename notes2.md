
# CSL Parser Specification

CSL = 💚 Clada Syntax Language

## Purpose

The CSL (Clada Markup Language) parser transforms git-style conflict marker syntax into executable file operations and shell commands, optimizing for LLM-friendly input while maintaining deterministic parsing through recursive descent with strict state transitions.

## Overview

CSL uses git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) to delimit operations,  The parser  handle nested conflict markers in file content. Operations include file creation/modification (`WRITE`, `SEARCH/REPLACE`, `SEARCH/REPLACE` "range" mode ) and shell execution (`RUN`), with attributes encoded inline. Tasks execute sequentially within `TASKS` blocks, with block-level failure isolation.

**Nested marker handling:**
```
<<<<<<< WRITE path="example.md"
This file contains conflict markers:
<<<<<<< HEAD
some content
=======
other content
>>>>>>> branch
>>>>>>>
```

## Standalone Operations

```
<<<<<<< WRITE path="simple.txt"
Hello world
>>>>>>>

<<<<<<< WRITE path="data.csv" append="true"
row1,data1
row2,data2
>>>>>>> 

<<<<<<< RUN
npm test
>>>>>>> 

<<<<<<< RUN dir="/tmp"
python script.py --verbose
>>>>>>> 
```

## Search/Replace Variants

```
<<<<<<< SEARCH path="app.js" count="1"
const old = "value";
=======
const new = "updated";
>>>>>>> REPLACE

<<<<<<< SEARCH path="config.json" count="2"
"debug": false
=======
"debug": true
>>>>>>> REPLACE

<<<<<<< SEARCH-START path="main.py" count="1"
def process_data(
<<<<<<< SEARCH-END
    return result
=======
def process_data(data, options=None):
    if options is None:
        options = {}
    filtered = apply_filters(data, options)
    return filtered
>>>>>>> REPLACE
```

## Task Blocks

```
<<<<<<< TASKS
<<<<<<< WRITE path="src/index.js"
console.log("app");
>>>>>>> END
<<<<<<< RUN
npm install
>>>>>>> END
>>>>>>> TASKS

<<<<<<< TASKS version="1.1"
<<<<<<< SEARCH path="package.json" count="1"
"version": "1.0.0"
=======
"version": "1.1.0"
>>>>>>> REPLACE
<<<<<<< RUN
git commit -m "bump version"
>>>>>>> END
>>>>>>> TASKS
```

## Nested Conflict Markers

```
<<<<<<< WRITE path="git-tutorial.md"
# Resolving Conflicts

When you see:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> branch-name

Choose which version to keep.
>>>>>>> END

<<<<<<< WRITE path="test-cases.txt"
<<<<<<< WRITE path="nested.txt"
This is not a real command
>>>>>>> END
>>>>>>> END
```

## Edge Cases

```
<<<<<<< WRITE path="empty.txt"
>>>>>>> END

<<<<<<< RUN

>>>>>>> END

<<<<<<< SEARCH path="minimal.js" count="1"
x
=======
y
>>>>>>> REPLACE

<<<<<<< WRITE path="multiline-attrs.js"
<<<<<<< RUN dir="/app"
echo "this line starts with marker pattern"
>>>>>>> END

<<<<<<< SEARCH-START path="complex.js" count="1"
<<<<<<< SEARCH-START
<<<<<<< SEARCH-END
=======
>>>>>>> REPLACE
```

## Multiple Operations

```
<<<<<<< WRITE path="build/output.js"
export default {};
>>>>>>> END
<<<<<<< TASKS
<<<<<<< RUN
mkdir -p dist
>>>>>>> END
<<<<<<< RUN
cp build/output.js dist/
>>>>>>> END
>>>>>>> TASKS
<<<<<<< SEARCH path="dist/output.js" count="1"
export default {};
=======
export default { version: "1.0" };
>>>>>>> REPLACE
```

## Invalid Syntax (Parser Must Handle)

```
<<<<<<< WRITE
missing required path attribute
>>>>>>> END

<<<<<<< SEARCH path="file.js"
missing separator and replace section
>>>>>>> REPLACE

<<<<<<< WRITE path="unclosed.txt"
never closed

<<<<<<< TASKS
<<<<<<< WRITE path="file.txt"
content
>>>>>>> END
missing TASKS close marker
```

> The count attribute is optional, as it defaults to one. Is that obvious in your examples? Or do we need another one? Also, we need another option for account where it could be a number or it could be the word "any"




The examples don't make the optional nature of `count` clear - I included it on every SEARCH operation. Need examples without it:

```
<<<<<<< SEARCH path="app.js"
const old = "value";
=======
const new = "updated";
>>>>>>> REPLACE

<<<<<<< SEARCH-START path="main.py"
def process_data(
<<<<<<< SEARCH-END
    return result
=======
def process_data(data, options=None):
    return apply_filters(data, options)
>>>>>>> REPLACE
```

For `count="all"`:

```
<<<<<<< SEARCH path="config.json" count="all"
"debug": false
=======
"debug": true
>>>>>>> REPLACE

<<<<<<< SEARCH-START path="test.py" count="all"
assert x == 
<<<<<<< SEARCH-END
10
=======
assert x == 20
>>>>>>> REPLACE
```
