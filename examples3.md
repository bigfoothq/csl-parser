
# CSL Parser Specification

CSL = 💚 Clada Syntax Language

## Purpose

The CSL (Clada Markup Language) parser transforms syntax into executable file operations and shell commands, optimizing for LLM-friendly input while maintaining deterministic parsing through recursive descent with strict state transitions.

this is syntax that only an LLM ai pair programmer will use.  goal is to be easy for LLM to learn and use with minimal mistakes and minimal cognitive overhead.  the purpose of special commands for WRITE and SEARCH/REPLACE is to make multiline text blocks easier and to focus on line-based operations so LLM doens't have to worry about char level edits etc


Here are all the examples converted to the new syntax:

## Standalone Operations

```
<---WRITE file="simple.txt"--->
Hello world
<---END--->

<---WRITE file="data.csv" append="true"--->
row1,data1
row2,data2
<---END--->

//one command per run block only
<---RUN--->
echo "one
   two 
three"
<---END--->

<---RUN dir="/tmp"--->
python script.py --verbose
<---END--->
```

## Search/Replace Variants

```
<---SEARCH file="app.js" count="2"--->
const old = "value";
<---REPLACE--->
const new = "updated";
<---END--->

//count assumed to be default of 1 here:
<---SEARCH file="config.json"--->
"debug": false
<---REPLACE--->
"debug": true
<---END--->

//search [implied] START and END blocks below both inclusive
<---SEARCH file="main.py" type="range" count="1"--->
def process_data(
<---TO--->
    return result
<---REPLACE--->
def process_data(data, options=None):
    if options is None:
        options = {}
    filtered = apply_filters(data, options)
    return filtered
<---END--->
```

## Task Blocks

```
<---TASKS--->
<---WRITE file="src/index.js"--->
console.log("app");
<---END--->
<---RUN--->
npm install
<---END--->
<---END TASKS--->

<---TASKS version="1.1"--->
<---SEARCH file="package.json" count="1"--->
"version": "1.0.0"
<---REPLACE--->
"version": "1.1.0"
<---END--->
<---RUN--->
git commit -m "bump version"
<---END--->
<---END TASKS--->
```