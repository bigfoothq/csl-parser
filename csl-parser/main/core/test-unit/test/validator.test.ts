import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../../src/validator.js';

describe('validate', () => {
  describe('required_fields', () => {
    describe('write_operations', () => {
      it('WRITE missing file attribute', () => {
        const result = validate([{type: 'WRITE', line: 1, content: 'hello'}]);
        assert.deepStrictEqual(result, [{
          line: 1,
          operation: 'WRITE',
          error: "Missing required attribute 'file'"
        }]);
      });

      it('WRITE missing file attribute with other attributes present', () => {
        const result = validate([{type: 'WRITE', line: 5, append: 'true', content: 'data'}]);
        assert.deepStrictEqual(result, [{
          line: 5,
          operation: 'WRITE',
          error: "Missing required attribute 'file'"
        }]);
      });
    });

    describe('search_operations', () => {
      it('SEARCH missing file attribute', () => {
        const result = validate([{type: 'SEARCH', line: 3, pattern: 'old', replacement: 'new'}]);
        assert.deepStrictEqual(result, [{
          line: 3,
          operation: 'SEARCH',
          error: "Missing required attribute 'file'"
        }]);
      });

      it('SEARCH missing file attribute with range replacement', () => {
        const result = validate([{type: 'SEARCH', line: 10, count: '2', pattern: 'find', to: 'end', replacement: 'replace'}]);
        assert.deepStrictEqual(result, [{
          line: 10,
          operation: 'SEARCH',
          error: "Missing required attribute 'file'"
        }]);
      });
    });

    describe('valid_operations', () => {
      it('WRITE with all required fields', () => {
        const result = validate([{type: 'WRITE', line: 1, file: 'test.txt', content: 'hello'}]);
        assert.deepStrictEqual(result, []);
      });

      it('RUN with all required fields', () => {
        const result = validate([{type: 'RUN', line: 2, content: 'echo test'}]);
        assert.deepStrictEqual(result, []);
      });

      it('SEARCH with all required fields', () => {
        const result = validate([{type: 'SEARCH', line: 3, file: 'app.js', pattern: 'old', replacement: 'new'}]);
        assert.deepStrictEqual(result, []);
      });

      it('TASKS with all required fields', () => {
        const result = validate([{type: 'TASKS', line: 4, operations: []}]);
        assert.deepStrictEqual(result, []);
      });
    });
  });

  describe('attribute_validation', () => {
    describe('count_values', () => {
      it('count value 0 is invalid', () => {
        const result = validate([{type: 'SEARCH', line: 1, file: 'test.js', count: '0', pattern: 'x', replacement: 'y'}]);
        assert.deepStrictEqual(result, [{
          line: 1,
          operation: 'SEARCH',
          error: "Invalid value for 'count': must be positive integer or 'all'",
          field: 'count'
        }]);
      });

      it('negative count value is invalid', () => {
        const result = validate([{type: 'SEARCH', line: 2, file: 'test.js', count: '-5', pattern: 'x', replacement: 'y'}]);
        assert.deepStrictEqual(result, [{
          line: 2,
          operation: 'SEARCH',
          error: "Invalid value for 'count': must be positive integer or 'all'",
          field: 'count'
        }]);
      });

      it('non-numeric count value is invalid', () => {
        const result = validate([{type: 'SEARCH', line: 3, file: 'test.js', count: 'invalid', pattern: 'x', replacement: 'y'}]);
        assert.deepStrictEqual(result, [{
          line: 3,
          operation: 'SEARCH',
          error: "Invalid value for 'count': must be positive integer or 'all'",
          field: 'count'
        }]);
      });

      it('decimal count value is invalid', () => {
        const result = validate([{type: 'SEARCH', line: 4, file: 'test.js', count: '3.14', pattern: 'x', replacement: 'y'}]);
        assert.deepStrictEqual(result, [{
          line: 4,
          operation: 'SEARCH',
          error: "Invalid value for 'count': must be positive integer or 'all'",
          field: 'count'
        }]);
      });

      it('count value 1 is valid', () => {
        const result = validate([{type: 'SEARCH', line: 1, file: 'test.js', count: '1', pattern: 'x', replacement: 'y'}]);
        assert.deepStrictEqual(result, []);
      });

      it('large count value is valid', () => {
        const result = validate([{type: 'SEARCH', line: 2, file: 'test.js', count: '999', pattern: 'x', replacement: 'y'}]);
        assert.deepStrictEqual(result, []);
      });

      it('count value all is valid', () => {
        const result = validate([{type: 'SEARCH', line: 3, file: 'test.js', count: 'all', pattern: 'x', replacement: 'y'}]);
        assert.deepStrictEqual(result, []);
      });
    });

    describe('append_values', () => {
      it('append value yes is invalid', () => {
        const result = validate([{type: 'WRITE', line: 1, file: 'log.txt', append: 'yes', content: 'data'}]);
        assert.deepStrictEqual(result, [{
          line: 1,
          operation: 'WRITE',
          error: "Invalid value for 'append': must be 'true' or 'false'",
          field: 'append'
        }]);
      });

      it('append value TRUE is invalid', () => {
        const result = validate([{type: 'WRITE', line: 2, file: 'log.txt', append: 'TRUE', content: 'data'}]);
        assert.deepStrictEqual(result, [{
          line: 2,
          operation: 'WRITE',
          error: "Invalid value for 'append': must be 'true' or 'false'",
          field: 'append'
        }]);
      });

      it('append value 1 is invalid', () => {
        const result = validate([{type: 'WRITE', line: 3, file: 'log.txt', append: '1', content: 'data'}]);
        assert.deepStrictEqual(result, [{
          line: 3,
          operation: 'WRITE',
          error: "Invalid value for 'append': must be 'true' or 'false'",
          field: 'append'
        }]);
      });

      it('append value true is valid', () => {
        const result = validate([{type: 'WRITE', line: 1, file: 'log.txt', append: 'true', content: 'data'}]);
        assert.deepStrictEqual(result, []);
      });

      it('append value false is valid', () => {
        const result = validate([{type: 'WRITE', line: 2, file: 'log.txt', append: 'false', content: 'data'}]);
        assert.deepStrictEqual(result, []);
      });
    });

    describe('unknown_attributes', () => {
      it('unknown attributes on WRITE are ignored', () => {
        const result = validate([{type: 'WRITE', line: 1, file: 'test.txt', unknown: 'value', custom: '123', content: 'data'}]);
        assert.deepStrictEqual(result, []);
      });

      it('unknown attributes on RUN are ignored', () => {
        const result = validate([{type: 'RUN', line: 2, extra: 'ignored', content: 'echo test'}]);
        assert.deepStrictEqual(result, []);
      });
    });
  });

  describe('content_validation', () => {
    describe('run_empty_content', () => {
      it('empty RUN content is invalid', () => {
        const result = validate([{type: 'RUN', line: 1, content: ''}]);
        assert.deepStrictEqual(result, [{
          line: 1,
          operation: 'RUN',
          error: "Empty content not allowed for RUN operation"
        }]);
      });

      it('empty RUN content with dir attribute is invalid', () => {
        const result = validate([{type: 'RUN', line: 5, dir: '/tmp', content: ''}]);
        assert.deepStrictEqual(result, [{
          line: 5,
          operation: 'RUN',
          error: "Empty content not allowed for RUN operation"
        }]);
      });

      it('RUN with non-empty content is valid', () => {
        const result = validate([{type: 'RUN', line: 1, content: 'echo test'}]);
        assert.deepStrictEqual(result, []);
      });

      it('RUN with whitespace content is valid', () => {
        const result = validate([{type: 'RUN', line: 2, content: ' '}]);
        assert.deepStrictEqual(result, []);
      });
    });

    describe('search_patterns', () => {
      it('empty search pattern is invalid', () => {
        const result = validate([{type: 'SEARCH', line: 1, file: 'test.js', pattern: '', replacement: 'new'}]);
        assert.deepStrictEqual(result, [{
          line: 1,
          operation: 'SEARCH',
          error: "Empty search pattern not allowed"
        }]);
      });

      it('empty search pattern with range is invalid', () => {
        const result = validate([{type: 'SEARCH', line: 3, file: 'app.py', pattern: '', to: 'end', replacement: 'code'}]);
        assert.deepStrictEqual(result, [{
          line: 3,
          operation: 'SEARCH',
          error: "Empty search pattern not allowed"
        }]);
      });

      it('empty TO pattern is invalid', () => {
        const result = validate([{type: 'SEARCH', line: 2, file: 'main.c', pattern: 'start', to: '', replacement: 'new'}]);
        assert.deepStrictEqual(result, [{
          line: 2,
          operation: 'SEARCH',
          error: "Empty TO pattern not allowed"
        }]);
      });

      it('non-empty search pattern is valid', () => {
        const result = validate([{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'find', replacement: 'replace'}]);
        assert.deepStrictEqual(result, []);
      });

      it('whitespace search pattern is valid', () => {
        const result = validate([{type: 'SEARCH', line: 2, file: 'test.js', pattern: ' ', replacement: 'space'}]);
        assert.deepStrictEqual(result, []);
      });
    });

    describe('valid_empty_content', () => {
      it('empty WRITE content is valid', () => {
        const result = validate([{type: 'WRITE', line: 1, file: 'empty.txt', content: ''}]);
        assert.deepStrictEqual(result, []);
      });

      it('empty REPLACE content is valid for deletion', () => {
        const result = validate([{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'remove', replacement: ''}]);
        assert.deepStrictEqual(result, []);
      });

      it('empty REPLACE content with range is valid for deletion', () => {
        const result = validate([{type: 'SEARCH', line: 2, file: 'clean.py', pattern: 'start', to: 'end', replacement: ''}]);
        assert.deepStrictEqual(result, []);
      });
    });
  });

  describe('nested_validation', () => {
    describe('tasks_in_tasks', () => {
      it('direct TASKS nesting is invalid', () => {
        const result = validate([{
          type: 'TASKS',
          line: 1,
          operations: [
            {type: 'TASKS', line: 2, operations: []}
          ]
        }]);
        assert.deepStrictEqual(result, [{
          line: 2,
          operation: 'TASKS',
          error: "TASKS cannot contain other TASKS operations"
        }]);
      });

      it('TASKS nested among other operations is invalid', () => {
        const result = validate([{
          type: 'TASKS',
          line: 5,
          version: '1.0',
          operations: [
            {type: 'WRITE', line: 6, file: 'test.txt', content: 'hello'},
            {type: 'TASKS', line: 7, operations: []},
            {type: 'RUN', line: 8, content: 'echo done'}
          ]
        }]);
        assert.deepStrictEqual(result, [{
          line: 7,
          operation: 'TASKS',
          error: "TASKS cannot contain other TASKS operations"
        }]);
      });
    });

    describe('deep_nesting', () => {
      it('deeply nested TASKS detection', () => {
        const result = validate([{
          type: 'TASKS',
          line: 1,
          operations: [
            {type: 'WRITE', line: 2, file: 'a.txt', content: 'a'},
            {
              type: 'TASKS',
              line: 3,
              operations: [
                {type: 'TASKS', line: 4, operations: []}
              ]
            }
          ]
        }]);
        assert.deepStrictEqual(result, [
          {line: 3, operation: 'TASKS', error: "TASKS cannot contain other TASKS operations"},
          {line: 4, operation: 'TASKS', error: "TASKS cannot contain other TASKS operations"}
        ]);
      });

      it('valid TASKS without nesting', () => {
        const result = validate([{
          type: 'TASKS',
          line: 1,
          operations: [
            {type: 'WRITE', line: 2, file: 'test.txt', content: 'data'},
            {type: 'RUN', line: 3, content: 'npm test'},
            {type: 'SEARCH', line: 4, file: 'app.js', pattern: 'old', replacement: 'new'}
          ]
        }]);
        assert.deepStrictEqual(result, []);
      });
    });
  });

  describe('edge_cases', () => {
    describe('multiple_errors', () => {
      it('multiple errors on same WRITE operation', () => {
        const result = validate([{type: 'WRITE', line: 1, append: 'invalid', content: 'data'}]);
        assert.deepStrictEqual(result, [
          {line: 1, operation: 'WRITE', error: "Missing required attribute 'file'"},
          {line: 1, operation: 'WRITE', error: "Invalid value for 'append': must be 'true' or 'false'", field: 'append'}
        ]);
      });

      it('multiple errors on same SEARCH operation', () => {
        const result = validate([{type: 'SEARCH', line: 5, count: 'bad', pattern: '', replacement: 'new'}]);
        assert.deepStrictEqual(result, [
          {line: 5, operation: 'SEARCH', error: "Missing required attribute 'file'"},
          {line: 5, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count'},
          {line: 5, operation: 'SEARCH', error: "Empty search pattern not allowed"}
        ]);
      });

      it('multiple operations with errors', () => {
        const result = validate([
          {type: 'WRITE', line: 1, content: 'test'},
          {type: 'RUN', line: 2, content: ''},
          {type: 'SEARCH', line: 3, file: 'app.js', pattern: '', replacement: 'x'}
        ]);
        assert.deepStrictEqual(result, [
          {line: 1, operation: 'WRITE', error: "Missing required attribute 'file'"},
          {line: 2, operation: 'RUN', error: "Empty content not allowed for RUN operation"},
          {line: 3, operation: 'SEARCH', error: "Empty search pattern not allowed"}
        ]);
      });
    });

    describe('empty_ast', () => {
      it('empty AST is valid', () => {
        const result = validate([]);
        assert.deepStrictEqual(result, []);
      });
    });

    describe('complex_scenarios', () => {
      it('nested TASKS with multiple errors', () => {
        const result = validate([{
          type: 'TASKS',
          line: 1,
          operations: [
            {type: 'WRITE', line: 2, append: 'wrong', content: ''},
            {type: 'RUN', line: 3, content: ''},
            {type: 'SEARCH', line: 4, count: '-1', pattern: '', to: '', replacement: ''},
            {type: 'TASKS', line: 5, operations: []}
          ]
        }]);
        assert.deepStrictEqual(result, [
          {line: 2, operation: 'WRITE', error: "Missing required attribute 'file'", parentTaskLine: 1},
          {line: 2, operation: 'WRITE', error: "Invalid value for 'append': must be 'true' or 'false'", field: 'append', parentTaskLine: 1},
          {line: 3, operation: 'RUN', error: "Empty content not allowed for RUN operation", parentTaskLine: 1},
          {line: 4, operation: 'SEARCH', error: "Missing required attribute 'file'", parentTaskLine: 1},
          {line: 4, operation: 'SEARCH', error: "Invalid value for 'count': must be positive integer or 'all'", field: 'count', parentTaskLine: 1},
          {line: 4, operation: 'SEARCH', error: "Empty search pattern not allowed", parentTaskLine: 1},
          {line: 4, operation: 'SEARCH', error: "Empty TO pattern not allowed", parentTaskLine: 1},
          {line: 5, operation: 'TASKS', error: "TASKS cannot contain other TASKS operations"}
        ]);
      });
    });
  });
});