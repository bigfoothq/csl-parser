20250122

# CSL Parser

Purpose: Parse CSL (Clada Syntax Language) text into Abstract Syntax Tree (AST).


----


# LLM File Edit Commands

## Commands
- **WRITE**: Replace entire file content
- **WRITE append=true**: Append to file end
- **SEARCH/REPLACE**: Find exact text and replace
- **SEARCH_FROM/INCLUSIVE_TO**: Replace text section
- **RUN**: Execute shell command (single line)
- **NODE23**: Execute Node.js code (multi-line)

## Syntax Rules
- Commands start with `file:` path
- Content wrapped in `<<————COMMAND` and `<<————END`
- Tags must start at line beginning
- Preserve exact whitespace/indentation
- `count=N` for multiple matches (default: 1)

## Examples

**Replace entire file:**
```
file: path/to/file.js
<<————WRITE
entire new content
<<————END
```

**Append to file:**
```
file: path/to/file.js
<<————WRITE append=true
new last line
<<————END
```

**Search and replace:**
```
file: path/to/file.js
<<————SEARCH
old text
<<————REPLACE
new text
<<————END
```

**Replace section (shorter syntax):**
```
file: path/to/file.js
<<————SEARCH_FROM
first unique line
<<————INCLUSIVE_TO
last unique line
<<————REPLACE
replacement content
<<————END
```

**Run shell command:**
```
<<————RUN
npm install package-name
<<————END
```

**Execute Node.js:**
```
<<————NODE23
const data = fs.readFileSync('file.txt', 'utf8');
fs.writeFileSync('output.txt', data.toUpperCase());
<<————END
```