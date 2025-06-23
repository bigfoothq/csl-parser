20250122

# CSL Parser

Purpose: Parse CSL (Clada Syntax Language) text into Abstract Syntax Tree (AST).

Overview: Single-pass state machine parser that converts CSL markup into operation objects. Validates syntax and structure only, not semantic rules. Provides detailed error messages with line numbers. Handles WRITE, RUN, SEARCH, and TASKS operations.