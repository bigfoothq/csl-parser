import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { parse } from '../../src/parser';

describe('operations', () => {
  describe('write', () => {
    describe('basic', () => {
      test('Simple WRITE operations', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---WRITE file="test.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file="data.csv"--->
hello world
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'data.csv', content: 'hello world'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`<---WRITE file="path/to/file.js"--->
const x = 1;
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'path/to/file.js', content: 'const x = 1;'}]
        );
      });
    });

    describe('append', () => {
      test('WRITE with append attribute', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---WRITE file="log.txt" append="true"--->
new entry
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'log.txt', append: 'true', content: 'new entry'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file="data.csv" append="false"--->
overwrite content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'data.csv', append: 'false', content: 'overwrite content'}]
        );
      });
    });

    describe('multiple_attrs', () => {
      test('WRITE with multiple attributes', () => {
        assert.deepStrictEqual(
          parse(`<---WRITE file="test.txt" append="true" custom="value"--->
content
<---END--->`),
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
          parse(`<---RUN--->
echo hello
<---END--->`),
          [{type: 'RUN', line: 1, content: 'echo hello'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---RUN--->
npm install
npm test
<---END--->`),
          [{type: 'RUN', line: 1, content: 'npm install\nnpm test'}]
        );
      });
    });

    describe('dir', () => {
      test('RUN with dir attribute', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---RUN dir="/workspace"--->
pwd
<---END--->`),
          [{type: 'RUN', line: 1, dir: '/workspace', content: 'pwd'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---RUN dir="./src"--->
ls -la
<---END--->`),
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
          parse(`<---SEARCH file="config.json"--->
"debug": false
<---REPLACE--->
"debug": true
<---END--->`),
          [{type: 'SEARCH', line: 1, file: 'config.json', pattern: '"debug": false', replacement: '"debug": true'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---SEARCH file="app.js"--->
oldValue
<---REPLACE--->
newValue
<---END--->`),
          [{type: 'SEARCH', line: 1, file: 'app.js', pattern: 'oldValue', replacement: 'newValue'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`<---SEARCH file="test.py"--->
def process():
    return None
<---REPLACE--->
def process():
    return 42
<---END--->`),
          [{type: 'SEARCH', line: 1, file: 'test.py', pattern: 'def process():\n    return None', replacement: 'def process():\n    return 42'}]
        );
      });
    });

    describe('range', () => {
      test('Pattern → to → replace', () => {
        assert.deepStrictEqual(
          parse(`<---SEARCH file="main.py"--->
def process(
<---TO--->
    return result
<---REPLACE--->
def process(data):
    return data
<---END--->`),
          [{type: 'SEARCH', line: 1, file: 'main.py', pattern: 'def process(', to: '    return result', replacement: 'def process(data):\n    return data'}]
        );
      });
    });

    describe('count', () => {
      test('SEARCH with count attribute', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---SEARCH file="test.js" count="3"--->
foo
<---REPLACE--->
bar
<---END--->`),
          [{type: 'SEARCH', line: 1, file: 'test.js', count: '3', pattern: 'foo', replacement: 'bar'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---SEARCH file="data.txt" count="all"--->
old
<---REPLACE--->
new
<---END--->`),
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
          parse(`<---TASKS--->
<---END--->`),
          [{type: 'TASKS', line: 1, operations: []}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---TASKS version="1.0"--->
<---END--->`),
          [{type: 'TASKS', line: 1, version: '1.0', operations: []}]
        );
      });
    });

    describe('single_op', () => {
      test('TASKS with one operation', () => {
        assert.deepStrictEqual(
          parse(`<---TASKS--->
<---WRITE file="test.txt"--->
content
<---END--->
<---END--->`),
          [{type: 'TASKS', line: 1, operations: [
            {type: 'WRITE', line: 2, file: 'test.txt', content: 'content'}
          ]}]
        );
      });
    });

    describe('multiple_ops', () => {
      test('TASKS with multiple operations', () => {
        assert.deepStrictEqual(
          parse(`<---TASKS--->
<---WRITE file="file1.txt"--->
content1
<---END--->
<---RUN--->
echo done
<---END--->
<---SEARCH file="config.json"--->
false
<---REPLACE--->
true
<---END--->
<---END--->`),
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
          parse(`<---WRITE file="test.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file="path with spaces.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'path with spaces.txt', content: 'content'}]
        );
      });
    });

    describe('single_quotes', () => {
      test("attr='value'", () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---WRITE file='test.txt'--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file='quote"inside.txt'--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'quote"inside.txt', content: 'content'}]
        );
      });
    });

    describe('empty_values', () => {
      test('attr=""', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---WRITE file="" append="true"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: '', append: 'true', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---RUN dir=""--->
pwd
<---END--->`),
          [{type: 'RUN', line: 1, dir: '', content: 'pwd'}]
        );
      });
    });

    describe('whitespace', () => {
      test('attr = "value" variations', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---WRITE file = "test.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file="test.txt"    append="true"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', append: 'true', content: 'content'}]
        );
      });
    });

    describe('exotic_names', () => {
      test('Non-alphanumeric attribute names', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---WRITE @file="test.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, '@file': 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file-name="test.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, 'file-name': 'test.txt', content: 'content'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`<---WRITE 123="numeric.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, '123': 'numeric.txt', content: 'content'}]
        );

        // Example 4
        assert.deepStrictEqual(
          parse(`<---WRITE $$$="special.txt"--->
content
<---END--->`),
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
          parse(`<---WRITE file="test\\"quote.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test"quote.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file="a\\"b\\"c.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'a"b"c.txt', content: 'content'}]
        );
      });
    });

    describe('single_quotes', () => {
      test("\\\' inside single quotes", () => {
        assert.deepStrictEqual(
          parse(`<---WRITE file='test\\'quote.txt'--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: "test'quote.txt", content: 'content'}]
        );
      });
    });

    describe('literal_backslash', () => {
      test('\\\\ sequences', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---WRITE file="test\\\\file.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test\\file.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file="C:\\\\Users\\\\test.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'C:\\Users\\test.txt', content: 'content'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`<---WRITE file="test\\nfile.txt"--->
content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test\\nfile.txt', content: 'content'}]
        );

        // Example 4
        assert.deepStrictEqual(
          parse(`<---WRITE file="test\\tfile.txt"--->
content
<---END--->`),
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
          () => parse(`<---WRITE file="test.txt" file="other.txt"--->
content
<---END--->`),
          { message: 'Line 1: Duplicate attribute: file' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---SEARCH file="test.js" count="1" count="all"--->
pattern
<---REPLACE--->
replacement
<---END--->`),
          { message: 'Line 1: Duplicate attribute: count' }
        );
      });
    });

    describe('unterminated', () => {
      test('Unterminated quotes', () => {
        // Example 1
        assert.throws(
          () => parse(`<---WRITE file="test.txt--->
content
<---END--->`),
          { message: 'Line 1: Unterminated quoted value' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---WRITE file='test.txt--->
content
<---END--->`),
          { message: 'Line 1: Unterminated quoted value' }
        );
      });
    });

    describe('unquoted', () => {
      test('attr=value (no quotes)', () => {
        assert.throws(
          () => parse(`<---WRITE file=test.txt--->
content
<---END--->`),
          { message: 'Line 1: Unquoted attribute value' }
        );
      });
    });

    describe('mismatched_quotes', () => {
      test('Mismatched quote types', () => {
        // Example 1
        assert.throws(
          () => parse(`<---WRITE file="test.txt'--->
content
<---END--->`),
          { message: 'Line 1: Unterminated quoted value' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---WRITE file='test.txt"--->
content
<---END--->`),
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
          parse(`<---WRITE file="test.txt"--->
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: ''}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---RUN--->
<---END--->`),
          [{type: 'RUN', line: 1, content: ''}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse(`<---SEARCH file="test.js"--->
<---REPLACE--->
replacement
<---END--->`),
          [{type: 'SEARCH', line: 1, file: 'test.js', pattern: '', replacement: 'replacement'}]
        );

        // Example 4
        assert.deepStrictEqual(
          parse(`<---SEARCH file="test.js"--->
pattern
<---REPLACE--->
<---END--->`),
          [{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'pattern', replacement: ''}]
        );
      });
    });

    describe('single_line', () => {
      test('One line of content', () => {
        assert.deepStrictEqual(
          parse(`<---WRITE file="test.txt"--->
single line
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'single line'}]
        );
      });
    });

    describe('multi_line', () => {
      test('Multiple lines', () => {
        assert.deepStrictEqual(
          parse(`<---WRITE file="test.txt"--->
line 1
line 2
line 3
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'line 1\nline 2\nline 3'}]
        );
      });
    });
  });

  describe('special', () => {
    describe('csl_like', () => {
      test('Content containing <--- markers', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---WRITE file="test.txt"--->
This looks like <---WRITE---> but is just content
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'This looks like <---WRITE---> but is just content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file="test.txt"--->
<---NOT-A-VALID-MARKER--->
<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: '<---NOT-A-VALID-MARKER--->'}]
        );
      });
    });

    describe('trailing_newlines', () => {
      test('Blank lines before END', () => {
        // Example 1
        assert.deepStrictEqual(
          parse(`<---WRITE file="test.txt"--->
content

<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---WRITE file="test.txt"--->
content


<---END--->`),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n\n'}]
        );
      });
    });

    describe('line_endings', () => {
      test('CRLF/LF/CR normalization', () => {
        // Example 1
        assert.deepStrictEqual(
          parse('<---WRITE file="test.txt"--->\r\ncontent\r\n<---END--->'),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse('<---WRITE file="test.txt"--->\r\ncontent\r\n\r\n<---END--->'),
          [{type: 'WRITE', line: 1, file: 'test.txt', content: 'content\n'}]
        );

        // Example 3
        assert.deepStrictEqual(
          parse('<---WRITE file="test.txt"--->\rcontent\r<---END--->'),
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
          parse(`<---WRITE file="test1.txt"--->
content1
<---END--->
<---WRITE file="test2.txt"--->
content2
<---END--->`),
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
          parse(`<---SEARCH file="test.py"--->
pattern
<---TO--->
end_pattern
<---REPLACE--->
replacement
<---END--->`),
          [{type: 'SEARCH', line: 1, file: 'test.py', pattern: 'pattern', to: 'end_pattern', replacement: 'replacement'}]
        );

        // Example 2
        assert.deepStrictEqual(
          parse(`<---SEARCH file="test.js"--->
pattern
<---REPLACE--->
replacement
<---END--->`),
          [{type: 'SEARCH', line: 1, file: 'test.js', pattern: 'pattern', replacement: 'replacement'}]
        );
      });
    });

    describe('tasks_context', () => {
      test('State changes in TASKS', () => {
        assert.deepStrictEqual(
          parse(`<---TASKS--->
<---WRITE file="test.txt"--->
content
<---END--->
<---RUN--->
echo done
<---END--->
<---END--->`),
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
        assert.throws(
          () => parse(`<---WRITE file="test.txt"--->
<---REPLACE--->
invalid
<---END--->`),
          { message: 'Line 2: REPLACE marker not valid in WRITE operation' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---RUN--->
<---TO--->
invalid
<---END--->`),
          { message: 'Line 2: TO marker not valid in RUN operation' }
        );
      });
    });

    describe('missing_end', () => {
      test('Unterminated operations', () => {
        // Example 1
        assert.throws(
          () => parse(`<---WRITE file="test.txt"--->
content`),
          { message: 'Line 1: Unterminated WRITE operation' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---SEARCH file="test.js"--->
pattern
<---REPLACE--->
replacement`),
          { message: 'Line 1: Unterminated SEARCH operation' }
        );
      });
    });

    describe('nested_tasks', () => {
      test('TASKS inside TASKS', () => {
        assert.throws(
          () => parse(`<---TASKS--->
<---TASKS--->
<---END--->
<---END--->`),
          { message: 'Line 2: TASKS cannot be nested' }
        );
      });
    });
  });
});

describe('parse_errors', () => {
  describe('malformed', () => {
    describe('incomplete', () => {
      test('<-- or ---> alone', () => {
        // Example 1
        assert.throws(
          () => parse(`<--WRITE file="test.txt"--->
content
<---END--->`),
          { message: 'Line 1: Malformed marker' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---WRITE file="test.txt"-->
content
<---END--->`),
          { message: 'Line 1: Malformed marker' }
        );
      });
    });

    describe('spaces', () => {
      test('Spaces in markers', () => {
        // Example 1
        assert.throws(
          () => parse(`<--- WRITE file="test.txt"--->
content
<---END--->`),
          { message: 'Line 1: Malformed marker' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---WRITE file="test.txt" --->
content
<---END--->`),
          { message: 'Line 1: Malformed marker' }
        );
      });
    });

    describe('invalid_line_start', () => {
      test('Lines starting with <--- must be valid markers', () => {
        // Example 1
        assert.throws(
          () => parse(`<---this is not a valid marker
content
<---END--->`),
          { message: 'Line 1: Malformed marker' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---
content
<---END--->`),
          { message: 'Line 1: Malformed marker' }
        );
      });
    });

    describe('unknown_ops', () => {
      test('<---INVALID--->', () => {
        // Example 1
        assert.throws(
          () => parse(`<---INVALID--->
content
<---END--->`),
          { message: 'Line 1: Unknown operation: INVALID' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---UNKNOWN file="test.txt"--->
content
<---END--->`),
          { message: 'Line 1: Unknown operation: UNKNOWN' }
        );
      });
    });

    describe('case_sensitive', () => {
      test('Operations must be uppercase', () => {
        // Example 1
        assert.throws(
          () => parse(`<---write file="test.txt"--->
content
<---END--->`),
          { message: 'Line 1: Unknown operation: write' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---Write file="test.txt"--->
content
<---END--->`),
          { message: 'Line 1: Unknown operation: Write' }
        );

        // Example 3
        assert.throws(
          () => parse(`<---TASKS--->
<---run--->
echo test
<---END--->
<---END--->`),
          { message: 'Line 2: Unknown operation: run' }
        );
      });
    });
  });

  describe('structural', () => {
    describe('unterminated', () => {
      test('Missing END', () => {
        assert.throws(
          () => parse(`<---WRITE file="test.txt"--->
content
<---WRITE file="test2.txt"--->`),
          { message: 'Line 3: WRITE marker not valid in WRITE operation' }
        );
      });
    });

    describe('content_on_marker', () => {
      test('<---END---> extra text', () => {
        assert.throws(
          () => parse(`<---WRITE file="test.txt"--->
content
<---END---> extra text`),
          { message: 'Line 3: Content not allowed on marker line' }
        );
      });
    });

    describe('end_with_attributes', () => {
      test('END markers cannot have attributes', () => {
        // Example 1
        assert.throws(
          () => parse(`<---WRITE file="test.txt"--->
content
<---END attr="value"--->`),
          { message: 'Line 3: END marker cannot have attributes' }
        );

        // Example 2
        assert.throws(
          () => parse(`<---RUN--->
echo test
<---END debug="true"--->`),
          { message: 'Line 3: END marker cannot have attributes' }
        );

        // Example 3
        assert.throws(
          () => parse(`<---WRITE file="test.txt"---> inline content
more content
<---END--->`),
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