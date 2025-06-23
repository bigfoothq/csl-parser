20250122

# CSL Parser Architecture

## Components

- parser: converts CSL text to AST through single-pass state machine processing (`main/core/src/parser.js`)
- validator: checks semantic rules on AST, reports all violations (`main/core/src/validator.js`)
- index: unified public API that combines parsing and validation (`main/core/src/index.js`)

## Error Handling Strategy

- **Syntax errors**: Fatal failures that prevent parsing (throws immediately)
- **Validation errors**: Semantic issues with specific operations (collected and returned)
- **Execution model**: Skip invalid operations/TASKS blocks, execute valid ones

## API Design

The public API (`index.js`) provides a single entry point that:
1. Parses CSL text (throws on syntax errors)
2. Validates the AST (collects all semantic errors)
3. Returns both AST and validation errors
4. Enables selective execution based on validation status