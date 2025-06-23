20250122

# CSL Parser User Stories

## Parse Valid CSL File
User provides valid CSL text with multiple operations. Parser returns AST array with operation objects containing type, attributes, content, and line numbers.

## Handle Syntax Errors
User provides CSL with malformed markers. Parser throws error with specific line number and clear message about the issue.

## Validate Required Attributes
User provides operation missing required attributes. Parser returns AST, validator reports error indicating which attribute is missing on which line.

## Process Nested TASKS
User provides TASKS block containing multiple operations. Parser returns TASKS object with operations array, maintaining proper line numbers for nested operations.

## Parse File With Semantic Errors
User provides CSL with missing required attributes but valid syntax. Parser returns complete AST. Validator reports all semantic errors with line numbers.