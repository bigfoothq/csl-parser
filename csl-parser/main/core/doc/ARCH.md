20250122

# CSL Parser Architecture

## Components

- parser: converts CSL text to AST through single-pass state machine processing
- validator: checks semantic rules on AST, reports all violations