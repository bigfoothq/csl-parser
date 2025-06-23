import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../../core/src/index.js';

describe('CSL Parser Integration Tests', () => {
  describe('Successful Parse and Validation', () => {
    it('parse(validCsl) → {ast: [...], validationErrors: []}', () => {
      const result = parse('<---WRITE file="test.txt"--->\ncontent\n<---END--->');
      assert.equal(result.validationErrors.length, 0);
      assert.equal(result.ast.length, 1);
      assert.equal(result.ast[0].type, 'WRITE');
      assert.equal(result.ast[0].file, 'test.txt');
      assert.equal(result.ast[0].content, 'content');
    });
  });

  describe('Parse Error (Syntax)', () => {
    it('parse("&lt;---INVALID---&gt;\\n&lt;---END---&gt;") → throws "Line 1: Unknown operation: INVALID"', () => {
      assert.throws(
        () => parse('<---INVALID--->\n<---END--->'),
        { message: 'Line 1: Unknown operation: INVALID' }
      );
    });

    it('parse("&lt;---WRITE") → throws "Line 1: Malformed marker"', () => {
      assert.throws(
        () => parse('<---WRITE'),
        { message: /Line 1: Malformed marker/ }
      );
    });
  });

  describe('Validation Errors (Semantic)', () => {
    it('parse("&lt;---WRITE---&gt;\\ncontent\\n&lt;---END---&gt;") → missing file attribute', () => {
      const result = parse('<---WRITE--->\ncontent\n<---END--->');
      assert.equal(result.ast.length, 1);
      assert.equal(result.ast[0].type, 'WRITE');
      assert.equal(result.ast[0].line, 1);
      assert.equal(result.ast[0].content, 'content');
      
      assert.equal(result.validationErrors.length, 1);
      assert.equal(result.validationErrors[0].line, 1);
      assert.equal(result.validationErrors[0].operation, 'WRITE');
      assert.equal(result.validationErrors[0].error, "Missing required attribute 'file'");
    });

    it('parse("&lt;---RUN---&gt;\\n&lt;---END---&gt;") → empty RUN content', () => {
      const result = parse('<---RUN--->\n<---END--->');
      assert.equal(result.ast.length, 1);
      assert.equal(result.ast[0].type, 'RUN');
      assert.equal(result.ast[0].line, 1);
      assert.equal(result.ast[0].content, '');
      
      assert.equal(result.validationErrors.length, 1);
      assert.equal(result.validationErrors[0].line, 1);
      assert.equal(result.validationErrors[0].operation, 'RUN');
      assert.equal(result.validationErrors[0].error, 'Empty content not allowed for RUN operation');
    });
  });

  describe('Multiple Operations with Mixed Validity', () => {
    it('parse(mixedValid) → {ast: [...], validationErrors: [...]}', () => {
      const csl = '<---WRITE file="a.txt"--->\nok\n<---END--->\n<---RUN--->\n<---END--->\n<---WRITE file="b.txt"--->\nok\n<---END--->';
      const result = parse(csl);
      
      assert.equal(result.ast.length, 3);
      assert.equal(result.ast[0].type, 'WRITE');
      assert.equal(result.ast[1].type, 'RUN');
      assert.equal(result.ast[2].type, 'WRITE');
      
      assert.equal(result.validationErrors.length, 1);
      assert.equal(result.validationErrors[0].line, 4);
      assert.equal(result.validationErrors[0].operation, 'RUN');
      assert.equal(result.validationErrors[0].error, 'Empty content not allowed for RUN operation');
    });
  });

  describe('TASKS with Nested Errors', () => {
    it('parse(tasksWithError) → validation error has parentTaskLine', () => {
      const csl = '<---TASKS--->\n<---WRITE file="ok.txt"--->\nok\n<---END--->\n<---RUN--->\n<---END--->\n<---END--->';
      const result = parse(csl);
      
      assert.equal(result.ast.length, 1);
      assert.equal(result.ast[0].type, 'TASKS');
      assert.equal(result.ast[0].operations.length, 2);
      
      assert.equal(result.validationErrors.length, 1);
      assert.equal(result.validationErrors[0].line, 5);
      assert.equal(result.validationErrors[0].operation, 'RUN');
      assert.equal(result.validationErrors[0].error, 'Empty content not allowed for RUN operation');
      assert.equal(result.validationErrors[0].parentTaskLine, 1);
    });
  });

  describe('Complex Nested Validation', () => {
    it('Multiple TASKS blocks with different validation states', () => {
      const csl = `<---TASKS--->\n<---WRITE file="ok.txt"--->\nok\n<---END--->\n<---END--->\n<---TASKS--->\n<---RUN--->\n<---END--->\n<---END--->`;
      const result = parse(csl);
      
      assert.equal(result.ast.length, 2);
      assert.equal(result.ast[0].type, 'TASKS');
      assert.equal(result.ast[1].type, 'TASKS');
      
      // First TASKS is valid
      assert.equal(result.ast[0].operations.length, 1);
      
      // Second TASKS has error
      assert.equal(result.validationErrors.length, 1);
      assert.equal(result.validationErrors[0].line, 7);
      assert.equal(result.validationErrors[0].parentTaskLine, 6);
    });
  });
});