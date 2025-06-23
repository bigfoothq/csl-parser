export interface ValidationError {
    line: number;
    operation: string;
    error: string;
    field?: string;
    parentTaskLine?: number;
}

export function validate(ast: any[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Validate each operation in the AST
    for (const operation of ast) {
        validateOperation(operation, errors, null);
    }
    
    return errors;
}

/**
 * Validates a single operation and adds any errors to the errors array
 * @param op - The operation to validate
 * @param errors - Array to collect validation errors
 * @param parentTaskLine - Line number of parent TASKS block, or null if not inside TASKS
 */
function validateOperation(op: any, errors: ValidationError[], parentTaskLine: number | null): void {
    // Check required attributes
    validateRequiredAttributes(op, errors, parentTaskLine);
    
    // Validate attribute values
    validateAttributeValues(op, errors, parentTaskLine);
    
    // Validate content requirements
    validateContent(op, errors, parentTaskLine);
    
    // Check for nested TASKS
    if (op.type === 'TASKS') {
        if (parentTaskLine !== null) {
            errors.push({
                line: op.line,
                operation: 'TASKS',
                error: "TASKS cannot contain other TASKS operations"
            });
        }
        
        // Validate nested operations
        if (op.operations) {
            for (const nestedOp of op.operations) {
                validateOperation(nestedOp, errors, op.line);
            }
        }
    }
}

/**
 * Validates that required attributes are present for each operation type
 */
function validateRequiredAttributes(op: any, errors: ValidationError[], parentTaskLine: number | null): void {
    switch (op.type) {
        case 'WRITE':
            if (!op.file) {
                const error: ValidationError = {
                    line: op.line,
                    operation: 'WRITE',
                    error: "Missing required attribute 'file'"
                };
                if (parentTaskLine !== null) {
                    error.parentTaskLine = parentTaskLine;
                }
                errors.push(error);
            }
            break;
            
        case 'SEARCH':
            if (!op.file) {
                const error: ValidationError = {
                    line: op.line,
                    operation: 'SEARCH',
                    error: "Missing required attribute 'file'"
                };
                if (parentTaskLine !== null) {
                    error.parentTaskLine = parentTaskLine;
                }
                errors.push(error);
            }
            break;
            
        // RUN and TASKS have no required attributes
    }
}

/**
 * Validates attribute values meet constraints
 */
function validateAttributeValues(op: any, errors: ValidationError[], parentTaskLine: number | null): void {
    // Validate count attribute (SEARCH only)
    if (op.count !== undefined && op.type === 'SEARCH') {
        if (!isValidCount(op.count)) {
            const error: ValidationError = {
                line: op.line,
                operation: 'SEARCH',
                error: "Invalid value for 'count': must be positive integer or 'all'",
                field: 'count'
            };
            if (parentTaskLine !== null) {
                error.parentTaskLine = parentTaskLine;
            }
            errors.push(error);
        }
    }
    
    // Validate append attribute (WRITE only)
    if (op.append !== undefined && op.type === 'WRITE') {
        if (op.append !== 'true' && op.append !== 'false') {
            const error: ValidationError = {
                line: op.line,
                operation: 'WRITE',
                error: "Invalid value for 'append': must be 'true' or 'false'",
                field: 'append'
            };
            if (parentTaskLine !== null) {
                error.parentTaskLine = parentTaskLine;
            }
            errors.push(error);
        }
    }
}

/**
 * Validates content requirements for each operation type
 */
function validateContent(op: any, errors: ValidationError[], parentTaskLine: number | null): void {
    switch (op.type) {
        case 'RUN':
            // RUN content cannot be empty
            if (op.content === '') {
                const error: ValidationError = {
                    line: op.line,
                    operation: 'RUN',
                    error: "Empty content not allowed for RUN operation"
                };
                if (parentTaskLine !== null) {
                    error.parentTaskLine = parentTaskLine;
                }
                errors.push(error);
            }
            break;
            
        case 'SEARCH':
            // Search pattern cannot be empty
            if (op.pattern === '') {
                const error: ValidationError = {
                    line: op.line,
                    operation: 'SEARCH',
                    error: "Empty search pattern not allowed"
                };
                if (parentTaskLine !== null) {
                    error.parentTaskLine = parentTaskLine;
                }
                errors.push(error);
            }
            
            // TO pattern cannot be empty (if present)
            if (op.to === '') {
                const error: ValidationError = {
                    line: op.line,
                    operation: 'SEARCH',
                    error: "Empty TO pattern not allowed"
                };
                if (parentTaskLine !== null) {
                    error.parentTaskLine = parentTaskLine;
                }
                errors.push(error);
            }
            break;
            
        // WRITE can have empty content (for creating empty files)
        // TASKS has no content field
    }
}

/**
 * Checks if a count value is valid (positive integer or 'all')
 */
function isValidCount(count: string): boolean {
    if (count === 'all') {
        return true;
    }
    
    // Check if it's a positive integer
    const num = Number(count);
    return Number.isInteger(num) && num > 0;
}