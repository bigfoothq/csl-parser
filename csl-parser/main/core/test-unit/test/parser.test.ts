import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { parse } from '../../src/parser.js';

const SD = "<---"
const ED = "--->"

describe('operations', () => {
  describe('write', () => {
    describe('basic', () => {
      test('Simple WRITE operations', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="data.csv"${ED}
hello world
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'data.csv', content: 'hello world'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="path/to/file.js"${ED}
const x = 1;
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'path/to/file.js', content: 'const x = 1;'}]
        );
      });
    });

    describe('append', () => {
      test('WRITE with append attribute', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="log.txt" append="true"${ED}
new entry
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'log.txt', append: 'true', content: 'new entry'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="data.csv" append="false"${ED}
overwrite content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'data.csv', append: 'false', content: 'overwrite content'}]
        );
      });
    });

    describe('multiple_attrs', () => {
      test('WRITE with multiple attributes', () => {
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt" append="true" custom="value"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', append: 'true', custom: 'value', content: 'content'}]
        );
      });
    });
  });

  describe('run', () => {
    describe('basic', () => {
      test('Simple RUN operations', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}RUN${ED}
echo hello
${SD}END${ED}`),
          [{type: 'RUN', line: 1, content: 'echo hello'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}RUN${ED}
npm install
npm test
${SD}END${ED}`),
          [{type: 'RUN', line: 1, content: 'npm install\nnpm test'}]
        );
      });
    });

    describe('dir', () => {
      test('RUN with dir attribute', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}RUN dir="/workspace"${ED}
pwd
${SD}END${ED}`),
          [{type: 'RUN', line: 1, dir: '/workspace', content: 'pwd'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}RUN dir="./src"${ED}
ls -la
${SD}END${ED}`),
          [{type: 'RUN', line: 1, dir: './src', content: 'ls -la'}]
        );
      });
    });
  });

  describe('search', () => {
    describe('simple', () => {
      test('Pattern → replace', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="config.json"${ED}
"debug": false
${SD}REPLACE${ED}
"debug": true
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'config.json', pattern: '"debug": false', replacement: '"debug": true'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="app.js"${ED}
oldValue
${SD}REPLACE${ED}
newValue
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'app.js', pattern: 'oldValue', replacement: 'newValue'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="test.py"${ED}
def process():
    return None
${SD}REPLACE${ED}
def process():
    return 42
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'test.py', pattern: 'def process():\n    return None', replacement: 'def process():\n    return 42'}]
        );
      });
    });

    describe('range', () => {
      test('Pattern → to → replace', () => {
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="main.py"${ED}
def process(
${SD}TO${ED}
    return result
${SD}REPLACE${ED}
def process(data):
    return data
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'main.py', pattern: 'def process(', to: '    return result', replacement: 'def process(data):\n    return data'}]
        );
      });
    });

    describe('count', () => {
      test('SEARCH with count attribute', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="test.js" count="3"${ED}
foo
${SD}REPLACE${ED}
bar
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'test.js', count: '3', pattern: 'foo', replacement: 'bar'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="data.txt" count="all"${ED}
old
${SD}REPLACE${ED}
new
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'data.txt', count: 'all', pattern: 'old', replacement: 'new'}]
        );
      });
    });
  });

  describe('tasks', () => {
    describe('empty', () => {
      test('Empty TASKS block', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}TASKS${ED}
${SD}END${ED}`),
          [{type: 'TASKS', line: 1, operations: []}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}TASKS version="1.0"${ED}
${SD}END${ED}`),
          [{type: 'TASKS', line: 1, version: '1.0', operations: []}]
        );
      });
    });

    describe('single_op', () => {
      test('TASKS with one operation', () => {
        assert.deepStrictEqual(
          parse(`${SD}TASKS${ED}
${SD}WRITE file="test.txt"${ED}
content
${SD}END${ED}
${SD}END${ED}`),
          [{type: 'TASKS', line: 1, operations: [
            {type: 'WRITE', line: 2, file: 'test.txt', content: 'content'}
          ]}]
        );
      });
    });

    describe('multiple_ops', () => {
      test('TASKS with multiple operations', () => {
        assert.deepStrictEqual(
          parse(`${SD}TASKS${ED}
${SD}WRITE file="file1.txt"${ED}
content1
${SD}END${ED}
${SD}RUN${ED}
echo done
${SD}END${ED}
${SD}SEARCH file="config.json"${ED}
false
${SD}REPLACE${ED}
true
${SD}END${ED}
${SD}END${ED}`),
          [{type: 'TASKS', line: 1, operations: [
            {type: 'WRITE', line: 2, file: 'file1.txt', content: 'content1'},
            {type: 'RUN', line: 5, content: 'echo done'},
            {type: 'SEARCH', line: 8, file: 'config.json', pattern: 'false', replacement: 'true'}
          ]}]
        );
      });
    });
  });
});

describe('attributes', () => {
  describe('syntax', () => {
    describe('double_quotes', () => {
      test('attr="value"', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="path with spaces.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'path with spaces.txt', content: 'content'}]
        );
      });
    });

    describe('single_quotes', () => {
      test("attr='value'", () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file='test.txt'${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file='quote"inside.txt'${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'quote"inside.txt', content: 'content'}]
        );
      });
    });

    describe('empty_values', () => {
      test('attr=""', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="" append="true"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: '', append: 'true', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}RUN dir=""${ED}
pwd
${SD}END${ED}`),
          [{type: 'RUN', line: 1, dir: '', content: 'pwd'}]
        );
      });
    });

    describe('whitespace', () => {
      test('attr = "value" variations', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file = "test.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"    append="true"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', append: 'true', content: 'content'}]
        );
      });
    });

    describe('exotic_names', () => {
      test('Non-alphanumeric attribute names', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE @file="test.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, '@file': 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file-name="test.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, 'file-name': 'test.txt', content: 'content'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`${SD}WRITE 123="numeric.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, '123': 'numeric.txt', content: 'content'}]
        );

        // Example 4
        assert.deepStrictEqual(
          parse(`${SD}WRITE $$$="special.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, '$$$': 'special.txt', content: 'content'}]
        );
      });
    });
  });

  describe('escaping', () => {
    describe('double_quotes', () => {
      test('\\" inside double quotes', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test\\"quote.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test"quote.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="a\\"b\\"c.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'a"b"c.txt', content: 'content'}]
        );
      });
    });

    describe('single_quotes', () => {
      test("\\\' inside single quotes", () => {
        assert.deepStrictEqual(
          parse(`${SD}WRITE file='test\\'quote.txt'${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: "test'quote.txt", content: 'content'}]
        );
      });
    });

    describe('literal_backslash', () => {
      test('\\\\ sequences', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test\\\\file.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test\\file.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="C:\\\\Users\\\\test.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'C:\\Users\\test.txt', content: 'content'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test\\nfile.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test\\nfile.txt', content: 'content'}]
        );

        // Example 4
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test\\tfile.txt"${ED}
content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test\\tfile.txt', content: 'content'}]
        );
      });
    });
  });

  describe('errors', () => {
    describe('duplicates', () => {
      test('Duplicate attribute detection', () => {
        // Example 1
        assert.throws(
          () => parse(`${SD}WRITE file="test.txt" file="other.txt"${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Duplicate attribute: file' }
        );

        // Example 2
        assert.throws(
          () => parse(`${SD}SEARCH file="test.js" count="1" count="all"${ED}
pattern
${SD}REPLACE${ED}
replacement
${SD}END${ED}`),
          { message: 'Line 1: Duplicate attribute: count' }
        );
      });
    });

    describe('unterminated', () => {
      test('Unterminated quotes', () => {
        // Example 1
        assert.throws(
          () => parse(`${SD}WRITE file="test.txt${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Unterminated quoted value' }
        );

        // Example 2
        assert.throws(
          () => parse(`${SD}WRITE file='test.txt${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Unterminated quoted value' }
        );
      });
    });

    describe('unquoted', () => {
      test('attr=value (no quotes)', () => {
        assert.throws(
          () => parse(`${SD}WRITE file=test.txt${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Unquoted attribute value' }
        );
      });
    });

    describe('mismatched_quotes', () => {
      test('Mismatched quote types', () => {
        // Example 1
        assert.throws(
          () => parse(`${SD}WRITE file="test.txt'${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Unterminated quoted value' }
        );

        // Example 2
        assert.throws(
          () => parse(`${SD}WRITE file='test.txt"${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Unterminated quoted value' }
        );
      });
    });
  });
});

describe('content', () => {
  describe('basic', () => {
    describe('empty', () => {
      test('Zero bytes between markers', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: ''}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}RUN${ED}
${SD}END${ED}`),
          [{type: 'RUN', line: 1, content: ''}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="test.js"${ED}
${SD}REPLACE${ED}
replacement
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'test.js', pattern: '', replacement: 'replacement'}]
        );

        // Example 4
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="test.js"${ED}
pattern
${SD}REPLACE${ED}
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'pattern', replacement: ''}]
        );
      });
    });

    describe('single_line', () => {
      test('One line of content', () => {
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
single line
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'single line'}]
        );
      });
    });

    describe('multi_line', () => {
      test('Multiple lines', () => {
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
line 1
line 2
line 3
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'line 1\nline 2\nline 3'}]
        );
      });
    });
  });

  describe('special', () => {
    describe('csl_like', () => {
      test('Content containing ${SD} markers', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
This looks like ${SD}WRITE${ED} but is just content
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: `This looks like ${SD}WRITE${ED} but is just content`}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
${SD}NOT-A-VALID-MARKER${ED}
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: `${SD}NOT-A-VALID-MARKER${ED}`}]
        );
      });
    });

    describe('trailing_newlines', () => {
      test('Blank lines before END', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
content

${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
content


${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n\n'}]
        );
      });
    });

    describe('line_endings', () => {
      test('CRLF/LF/CR normalization', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}\r\ncontent\r\n${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}\r\ncontent\r\n\r\n${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}\rcontent\r${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );
      });
    });
  });
});

describe('state_machine', () => {
  describe('valid', () => {
    describe('sequences', () => {
      test('Valid operation orders', () => {
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test1.txt"${ED}
content1
${SD}END${ED}
${SD}WRITE file="test2.txt"${ED}
content2
${SD}END${ED}`),
          [
            {type: 'WRITE', line: 1, file: 'test1.txt', content: 'content1'},
            {type: 'WRITE', line: 4, file: 'test2.txt', content: 'content2'}
          ]
        );
      });
    });

    describe('search_flow', () => {
      test('SEARCH → TO → REPLACE → END', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="test.py"${ED}
pattern
${SD}TO${ED}
end_pattern
${SD}REPLACE${ED}
replacement
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'test.py', pattern: 'pattern', to: 'end_pattern', replacement: 'replacement'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}SEARCH file="test.js"${ED}
pattern
${SD}REPLACE${ED}
replacement
${SD}END${ED}`),
          [{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'pattern', replacement: 'replacement'}]
        );
      });
    });

    describe('tasks_context', () => {
      test('State changes in TASKS', () => {
        assert.deepStrictEqual(
          parse(`${SD}TASKS${ED}
${SD}WRITE file="test.txt"${ED}
content
${SD}END${ED}
${SD}RUN${ED}
echo done
${SD}END${ED}
${SD}END${ED}`),
          [{type: 'TASKS', line: 1, operations: [
            {type: 'WRITE', line: 2, file: 'test.txt', content: 'content'},
            {type: 'RUN', line: 5, content: 'echo done'}
          ]}]
        );
      });
    });
  });

  describe('invalid', () => {
    describe('wrong_marker', () => {
      test('Invalid marker for state', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`${SD}WRITE file="test.txt"${ED}
${SD}REPLACE${ED}
invalid
${SD}END${ED}`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: `${SD}REPLACE${ED}\ninvalid`}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`${SD}RUN${ED}
${SD}TO${ED}
invalid
${SD}END${ED}`),
          [{type: 'RUN', line: 1, content: `${SD}TO${ED}\ninvalid`}]
        );
      });
    });

    describe('missing_end', () => {
      test('Unterminated operations', () => {
        // Example 1
        assert.throws(
          () => parse(`${SD}WRITE file="test.txt"${ED}
content`),
          { message: 'Line 1: Unterminated WRITE operation' }
        );

        // Example 2
        assert.throws(
          () => parse(`${SD}SEARCH file="test.js"${ED}
pattern
${SD}REPLACE${ED}
replacement`),
          { message: 'Line 1: Unterminated SEARCH operation' }
        );
      });
    });

    describe('nested_tasks', () => {
      test('TASKS inside TASKS', () => {
        assert.throws(
          () => parse(`${SD}TASKS${ED}
${SD}TASKS${ED}
${SD}END${ED}
${SD}END${ED}`),
          { message: 'Line 2: TASKS cannot be nested' }
        );
      });
    });
  });
});

describe('parse_errors', () => {
  describe('malformed', () => {
    describe('unclosed', () => {
      test('notclosed', () => {

        // Example 2
        assert.throws(
          () => parse(`${SD}WRITE file="test.txt"
content
${SD}END${ED}`),
          { message: 'Line 1: Malformed marker' }
        );
      });
    });

    describe('invalid_line_start', () => {
      test('Lines starting with ${SD} must be valid markers', () => {
        // Example 1
        assert.throws(
          () => parse(`${SD}this is not a valid marker
content
${SD}END${ED}`),
          { message: 'Line 1: Malformed marker' }
        );

        // Example 2
        assert.throws(
          () => parse(`${SD}
content
${SD}END${ED}`),
          { message: 'Line 1: Malformed marker' }
        );
      });
    });

    describe('unknown_ops', () => {
      test('${SD}INVALID${ED}', () => {
        // Example 1
        assert.throws(
          () => parse(`${SD}INVALID${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Unknown operation: INVALID' }
        );

        // Example 2
        assert.throws(
          () => parse(`${SD}UNKNOWN file="test.txt"${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Unknown operation: UNKNOWN' }
        );
      });
    });

    describe('case_sensitive', () => {
      test('Operations must be uppercase', () => {
        // Example 1
        assert.throws(
          () => parse(`${SD}write file="test.txt"${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Unknown operation: write' }
        );

        // Example 2
        assert.throws(
          () => parse(`${SD}Write file="test.txt"${ED}
content
${SD}END${ED}`),
          { message: 'Line 1: Unknown operation: Write' }
        );

        // Example 3
        assert.throws(
          () => parse(`${SD}TASKS${ED}
${SD}run${ED}
echo test
${SD}END${ED}
${SD}END${ED}`),
          { message: 'Line 2: Unknown operation: run' }
        );
      });
    });
  });

  describe('structural', () => {
    describe('unterminated', () => {
      test('Missing END', () => {
        assert.throws(
          () => parse(`${SD}WRITE file="test.txt"${ED}
content
${SD}WRITE file="test2.txt"${ED}`),
          { message: 'Line 1: Unterminated WRITE operation' }
        );
      });
    });

    describe('content_on_marker', () => {
      test('${SD}END${ED} extra text', () => {
        assert.throws(
          () => parse(`${SD}WRITE file="test.txt"${ED}
content
${SD}END${ED} extra text`),
          { message: 'Line 3: Content not allowed on marker line' }
        );
      });
    });

    describe('end_with_attributes', () => {
      test('END markers cannot have attributes', () => {
        // Example 1
        assert.throws(
          () => parse(`${SD}WRITE file="test.txt"${ED}
content
${SD}END attr="value"${ED}`),
          { message: 'Line 3: END marker cannot have attributes' }
        );

        // Example 2
        assert.throws(
          () => parse(`${SD}RUN${ED}
echo test
${SD}END debug="true"${ED}`),
          { message: 'Line 3: END marker cannot have attributes' }
        );

        // Example 3
        assert.throws(
          () => parse(`${SD}WRITE file="test.txt"${ED} inline content
more content
${SD}END${ED}`),
          { message: 'Line 1: Content not allowed on marker line' }
        );
      });
    });
  });
});

describe('options', () => {
  describe('custom_delimiters', () => {
    test('Using custom start/end delimiters', () => {
      // Example 1
      assert.deepStrictEqual(
        parse(`@[[[[WRITE file="test.txt"]]]]@
content
@[[[[END]]]]@`, {startDelimiter: '@[[[[', endDelimiter: ']]]]@'}),
        [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
      );

      // Example 2
      assert.deepStrictEqual(
        parse(`@[[[[TASKS]]]]@
@[[[[RUN]]]]@
echo test
@[[[[END]]]]@
@[[[[END]]]]@`, {startDelimiter: '@[[[[', endDelimiter: ']]]]@'}),
        [{type: 'TASKS', line: 1, operations: [
          {type: 'RUN', line: 2, content: 'echo test'}
        ]}]
      );

      // Example 3
      assert.deepStrictEqual(
        parse(`@[[[[SEARCH file="config.json"]]]]@
"debug": false
@[[[[REPLACE]]]]@
"debug": true
@[[[[END]]]]@`, {startDelimiter: '@[[[[', endDelimiter: ']]]]@'}),
        [{type: 'SEARCH', line: 1, file: 'config.json', pattern: '"debug": false', replacement: '"debug": true'}]
      );
    });
  });
});