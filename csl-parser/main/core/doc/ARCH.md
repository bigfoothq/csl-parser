20250122

# CSL Parser Architecture

## Components

- parser: converts CSL text to AST through single-pass state machine processing (`main/core/src/parser.js`)
- validator: checks semantic rules on AST, reports all violations (`main/core/src/validator.js`)