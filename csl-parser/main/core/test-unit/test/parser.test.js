// 20250122

// import { test } from 'node:test';
// import assert from 'node:assert/strict';
// import { parse } from '../../src/parser.js';

// // Happy Path - Basic Operations

// test('parse WRITE operation', () => {
//   const input = `<---WRITE file="test.txt"--->\nhello world\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'test.txt',
//     content: 'hello world\n',
//     line: 1
//   }]);
// });

// test('parse RUN operation', () => {
//   const input = `<---RUN--->\nnpm install\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'RUN',
//     content: 'npm install\n',
//     line: 1
//   }]);
// });

// test('parse WRITE with append attribute', () => {
//   const input = `<---WRITE file="log.txt" append="true"--->\nnew entry\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'log.txt',
//     append: 'true',
//     content: 'new entry\n',
//     line: 1
//   }]);
// });

// // Happy Path - Search Operations

// test('parse SEARCH with simple replacement', () => {
//   const input = `<---SEARCH file="config.json"--->\n"debug": false\n<---REPLACE--->\n"debug": true\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'SEARCH',
//     file: 'config.json',
//     pattern: '"debug": false\n',
//     replacement: '"debug": true\n',
//     line: 1
//   }]);
// });

// test('parse SEARCH with TO range', () => {
//   const input = `<---SEARCH file="main.py"--->\ndef old_func():\n    pass\n<---TO--->\n    return None\n<---REPLACE--->\ndef new_func():\n    return 42\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'SEARCH',
//     file: 'main.py',
//     pattern: 'def old_func():\n    pass\n',
//     to: '    return None\n',
//     replacement: 'def new_func():\n    return 42\n',
//     line: 1
//   }]);
// });

// test('parse SEARCH with count attribute', () => {
//   const input = `<---SEARCH file="test.js" count="all"--->\nfoo\n<---REPLACE--->\nbar\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'SEARCH',
//     file: 'test.js',
//     count: 'all',
//     pattern: 'foo\n',
//     replacement: 'bar\n',
//     line: 1
//   }]);
// });

// // Happy Path - TASKS

// test('parse TASKS with multiple operations', () => {
//   const input = `<---TASKS--->\n<---WRITE file="a.txt"--->\ncontent a\n<---END--->\n<---RUN--->\necho done\n<---END--->\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'TASKS',
//     operations: [
//       {
//         type: 'WRITE',
//         file: 'a.txt',
//         content: 'content a\n',
//         line: 2
//       },
//       {
//         type: 'RUN',
//         content: 'echo done\n',
//         line: 5
//       }
//     ],
//     line: 1
//   }]);
// });

// // Error Cases - Missing Required Attributes

// test('WRITE without file attribute throws', () => {
//   const input = `<---WRITE--->\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Missing required attribute: file'
//   });
// });

// test('SEARCH without file attribute throws', () => {
//   const input = `<---SEARCH--->\npattern\n<---REPLACE--->\nnew\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Missing required attribute: file'
//   });
// });

// // Error Cases - Empty Content Violations

// test('empty RUN content throws', () => {
//   const input = `<---RUN--->\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 2: Empty RUN content'
//   });
// });

// test('empty SEARCH pattern throws', () => {
//   const input = `<---SEARCH file="test.js"--->\n<---REPLACE--->\nreplacement\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 2: Empty SEARCH pattern'
//   });
// });

// test('empty TO pattern throws', () => {
//   const input = `<---SEARCH file="test.js"--->\npattern\n<---TO--->\n<---REPLACE--->\nreplacement\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 4: Empty TO pattern'
//   });
// });

// // Error Cases - Invalid Operations/Markers

// test('unknown operation throws', () => {
//   const input = `<---INVALID--->\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Unknown operation: INVALID'
//   });
// });

// test('invalid marker format throws', () => {
//   const input = `<--- WRITE file="test"--->\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Invalid marker format'
//   });
// });

// // Error Cases - Structural Violations

// test('unclosed operation throws', () => {
//   const input = `<---WRITE file="test.txt"--->\nunclosed`;
//   assert.throws(() => parse(input), {
//     message: 'Line 3: Unexpected end of input'
//   });
// });

// test('nested TASKS throws', () => {
//   const input = `<---TASKS--->\n<---TASKS--->\n<---END--->\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 2: TASKS cannot be nested'
//   });
// });

// // Error Cases - Duplicate Attributes

// test('duplicate attribute throws', () => {
//   const input = `<---WRITE file="a.txt" file="b.txt"--->\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Duplicate attribute: file'
//   });
// });

// // Error Cases - Invalid Attribute Values

// test('invalid count value throws', () => {
//   const input = `<---SEARCH file="test.js" count="invalid"--->\npattern\n<---REPLACE--->\nnew\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Invalid count value: invalid'
//   });
// });

// test('invalid append value throws', () => {
//   const input = `<---WRITE file="test.txt" append="yes"--->\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Invalid append value: yes'
//   });
// });

// // Error Cases - Malformed Attribute Syntax

// test('unquoted attribute value throws', () => {
//   const input = `<---WRITE file=unquoted--->\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Invalid marker format'
//   });
// });

// test('unterminated quote throws', () => {
//   const input = `<---WRITE file="unterminated--->\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Invalid marker format'
//   });
// });

// test('mismatched quotes throws', () => {
//   const input = `<---WRITE file='mismatched"--->\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Invalid marker format'
//   });
// });

// // Error Cases - Marker Format Violations

// test('space before closing delimiter throws', () => {
//   const input = `<---WRITE file="test.txt" --->\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Invalid marker format'
//   });
// });

// test('space within closing delimiter throws', () => {
//   const input = `<---WRITE file="test.txt"--- >\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: Invalid marker format'
//   });
// });

// // Edge Cases - Attribute Escaping

// test('parse double quote escape', () => {
//   const input = `<---WRITE file="test\\"quote.txt"--->\ncontent\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'test"quote.txt',
//     content: 'content\n',
//     line: 1
//   }]);
// });

// test('parse single quote escape', () => {
//   const input = `<---WRITE file='test\\'quote.txt'--->\ncontent\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: "test'quote.txt",
//     content: 'content\n',
//     line: 1
//   }]);
// });

// test('parse backslash in attribute', () => {
//   const input = `<---WRITE file="path\\\\with\\\\backslash"--->\ncontent\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'path\\with\\backslash',
//     content: 'content\n',
//     line: 1
//   }]);
// });

// // Edge Cases - CSL Syntax in Content

// test('parse CSL syntax as literal content', () => {
//   const input = `<---WRITE file="nested.csl"--->\n<---WRITE file="inner"--->\nThis is literal text\n<---END--->\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'nested.csl',
//     content: '<---WRITE file="inner"--->\nThis is literal text\n<---END--->\n',
//     line: 1
//   }]);
// });

// // Edge Cases - Empty Values

// test('parse empty file attribute', () => {
//   const input = `<---WRITE file=""--->\ncontent\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: '',
//     content: 'content\n',
//     line: 1
//   }]);
// });

// test('parse empty replacement', () => {
//   const input = `<---SEARCH file="test.js"--->\npattern\n<---REPLACE--->\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'SEARCH',
//     file: 'test.js',
//     pattern: 'pattern\n',
//     replacement: '',
//     line: 1
//   }]);
// });

// // Edge Cases - Multiple Operations

// test('parse multiple operations', () => {
//   const input = `<---WRITE file="a.txt"--->\nfirst\n<---END--->\n<---WRITE file="b.txt"--->\nsecond\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [
//     {
//       type: 'WRITE',
//       file: 'a.txt',
//       content: 'first\n',
//       line: 1
//     },
//     {
//       type: 'WRITE',
//       file: 'b.txt',
//       content: 'second\n',
//       line: 4
//     }
//   ]);
// });

// // Edge Cases - Whitespace Between Attributes

// test('parse multiple spaces between attributes', () => {
//   const input = `<---WRITE   file="a.txt"     append="true"--->\ncontent\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'a.txt',
//     append: 'true',
//     content: 'content\n',
//     line: 1
//   }]);
// });

// // Edge Cases - Attribute Values with Equals

// test('parse attribute value containing equals', () => {
//   const input = `<---WRITE file="query=param&x=y"--->\ncontent\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'query=param&x=y',
//     content: 'content\n',
//     line: 1
//   }]);
// });

// // Edge Cases - Mixed Line Endings

// test('parse mixed line endings', () => {
//   const input = '<---WRITE file="test.txt"--->\r\nline1\r\nline2\rline3\n<---END--->';
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'test.txt',
//     content: 'line1\r\nline2\rline3\n',
//     line: 1
//   }]);
// });

// // Edge Cases - Partial Markers in Content

// test('parse partial markers as content', () => {
//   const input = `<---WRITE file="test.txt"--->\nThis <-- is not --> a marker\n<--- also not a marker\n--->\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'test.txt',
//     content: 'This <-- is not --> a marker\n<--- also not a marker\n--->\n',
//     line: 1
//   }]);
// });

// // Edge Cases - Invalid Context Markers

// test('TO marker outside SEARCH throws', () => {
//   const input = `<---TO--->\ncontent\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 1: TO marker not valid outside SEARCH operation'
//   });
// });

// test('TO marker in WRITE throws', () => {
//   const input = `<---WRITE file="test.txt"--->\n<---TO--->\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 2: TO not valid in WRITE operation'
//   });
// });

// // Edge Cases - END Marker Attributes

// test('END marker with attributes throws', () => {
//   const input = `<---WRITE file="test.txt"--->\ncontent\n<---END attr="value"--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 3: END marker cannot have attributes'
//   });
// });

// // Edge Cases - Empty TASKS

// test('parse empty TASKS', () => {
//   const input = `<---TASKS--->\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'TASKS',
//     operations: [],
//     line: 1
//   }]);
// });

// // Edge Cases - No Trailing Newline

// test('parse without trailing newline', () => {
//   const input = '<---WRITE file="test.txt"--->\ncontent<---END--->';
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'test.txt',
//     content: 'content',
//     line: 1
//   }]);
// });

// // Edge Cases - Line Number Accuracy

// test('operation starting on line 3', () => {
//   const input = `\n\n<---WRITE file="test.txt"--->\ncontent\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'test.txt',
//     content: 'content\n',
//     line: 3
//   }]);
// });

// test('empty RUN in second operation reports correct line', () => {
//   const input = `<---SEARCH file="test.js"--->\npattern\n<---REPLACE--->\n<---END--->\n<---RUN--->\n<---END--->`;
//   assert.throws(() => parse(input), {
//     message: 'Line 6: Empty RUN content'
//   });
// });

// // Edge Cases - Mixed Content and Operations

// test('parse with non-operation content before and after', () => {
//   const input = `random text here\n\n<---WRITE file="test.txt"--->\ncontent\n<---END--->\n\nmore random text`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'WRITE',
//     file: 'test.txt',
//     content: 'content\n',
//     line: 3
//   }]);
// });

// test('parse TASKS with interspersed non-operation content', () => {
//   const input = `<---TASKS--->\nsome text before operations\n<---WRITE file="a.txt"--->\ncontent\n<---END--->\ntext between operations\n<---RUN--->\necho hi\n<---END--->\ntext after operations\n<---END--->`;
//   const result = parse(input);
//   assert.deepEqual(result, [{
//     type: 'TASKS',
//     operations: [
//       {
//         type: 'WRITE',
//         file: 'a.txt',
//         content: 'content\n',
//         line: 3
//       },
//       {
//         type: 'RUN',
//         content: 'echo hi\n',
//         line: 7
//       }
//     ],
//     line: 1
//   }]);
// });

// test('parse multiple operations with text between', () => {
//   const input = `text before\n<---WRITE file="a.txt"--->\nfirst\n<---END--->\ntext between\n<---WRITE file="b.txt"--->\nsecond\n<---END--->\ntext after`;
//   const result = parse(input);
//   assert.deepEqual(result, [
//     {
//       type: 'WRITE',
//       file: 'a.txt',
//       content: 'first\n',
//       line: 2
//     },
//     {
//       type: 'WRITE',
//       file: 'b.txt',
//       content: 'second\n',
//       line: 6
//     }
//   ]);
// });