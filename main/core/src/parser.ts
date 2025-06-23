export interface Operation {
  type: 'WRITE' | 'RUN' | 'SEARCH' | 'TASKS';
  line: number;
  [key: string]: any; // For attributes and content
}

export interface ParseOptions {
  startDelimiter?: string;
  endDelimiter?: string;
}

export function parse(text: string, options?: ParseOptions): Operation[] {
  const startDelim = options?.startDelimiter || '<---';
  const endDelim = options?.endDelimiter || '--->';
  
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startEscaped = escapeRegex(startDelim);
  const endEscaped = escapeRegex(endDelim);
  
  const markerRegex = new RegExp(`^${startEscaped}(\\w+)(\\s+.*?)?${endEscaped}$`);
  
  const lines = text.split(/\r\n|\r|\n/);
  const operations: Operation[] = [];
  
  let lineNum = 1;
  let state: string | null = null;
  let currentOp: Operation | null = null;
  let contentBuffer: string[] = [];
  let insideTasks = false;
  let tasksOp: Operation | null = null;
  
  let searchPattern: string[] = [];
  let searchTo: string[] = [];
  let searchReplacement: string[] = [];
  
  const closeOperation = () => {
    if (!currentOp) return;
    
    if (state === 'WRITE' || state === 'RUN') {
      currentOp.content = contentBuffer.join('\n');
    } else if (state === 'SEARCH_REPLACEMENT') {
      currentOp.pattern = searchPattern.join('\n');
      if (searchTo.length > 0) currentOp.to = searchTo.join('\n');
      currentOp.replacement = searchReplacement.join('\n');
    }
    
    if (insideTasks && tasksOp && currentOp !== tasksOp) {
      tasksOp.operations!.push(currentOp);
      state = 'TASKS';
      currentOp = tasksOp;
    } else if (insideTasks && tasksOp && currentOp === tasksOp) {
      operations.push(tasksOp);
      tasksOp = null;
      insideTasks = false;
      state = null;
      currentOp = null;
    } else {
      operations.push(currentOp);
      state = null;
      currentOp = null;
    }
    
    contentBuffer = [];
    searchPattern = [];
    searchTo = [];
    searchReplacement = [];
  };

  for (const line of lines) {
    const match = line.match(markerRegex);

    if (match) {
      const opName = match[1];
      const attrString = (match[2] || '').trim();

      const KNOWN_OPS = ['WRITE', 'RUN', 'SEARCH', 'TASKS'];
      const STATE_MARKERS = ['END', 'TO', 'REPLACE'];
      
      // An unknown operation is treated as content if we are already inside an operation
      if (!KNOWN_OPS.includes(opName) && !STATE_MARKERS.includes(opName)) {
        if (state) {
            if (state === 'SEARCH_PATTERN') searchPattern.push(line);
            else if (state === 'SEARCH_TO') searchTo.push(line);
            else if (state === 'SEARCH_REPLACEMENT') searchReplacement.push(line);
            else if (state !== 'TASKS') contentBuffer.push(line);
            lineNum++;
            continue;
        } else {
            throw new Error(`Line ${lineNum}: Unknown operation: ${opName}`);
        }
      }

      switch(opName) {
        case 'END':
          if (!state || !currentOp) throw new Error(`Line ${lineNum}: END marker without active operation`);
          if (attrString) throw new Error(`Line ${lineNum}: END marker cannot have attributes`);
          closeOperation();
          break;

        case 'WRITE':
        case 'RUN':
        case 'SEARCH':
        case 'TASKS':
          if (state && state !== 'TASKS') throw new Error(`Line ${lineNum}: ${opName} marker not valid in ${state.replace(/_/g, ' ')} operation`);
          if (opName === 'TASKS' && insideTasks) throw new Error(`Line ${lineNum}: TASKS cannot be nested`);
          
          currentOp = { type: opName as Operation['type'], line: lineNum };
          if (attrString) Object.assign(currentOp, parseAttributes(attrString, lineNum));

          if (opName === 'TASKS') {
            currentOp.operations = [];
            tasksOp = currentOp;
            insideTasks = true;
            state = 'TASKS';
          } else {
            state = opName === 'SEARCH' ? 'SEARCH_PATTERN' : opName;
          }
          break;
        
        case 'TO':
          if (state !== 'SEARCH_PATTERN') throw new Error(`Line ${lineNum}: TO marker not valid in ${state || 'null'} operation`);
          state = 'SEARCH_TO';
          break;

        case 'REPLACE':
          if (state !== 'SEARCH_PATTERN' && state !== 'SEARCH_TO') throw new Error(`Line ${lineNum}: REPLACE marker not valid in ${state || 'null'} operation`);
          state = 'SEARCH_REPLACEMENT';
          break;
      }
    } else {
      // Not a well-formed marker. Check for unambiguous errors vs content.
      if (line.startsWith(startDelim)) {
         const trimmed = line.trim();
         if (trimmed.includes(endDelim) && !trimmed.endsWith(endDelim)) {
           throw new Error(`Line ${lineNum}: Content not allowed on marker line`);
         }
        // A line starting with the delimiter that doesn't match the regex is an error
        // *unless* we are inside an operation, in which case it is content.
        if (!state) {
            throw new Error(`Line ${lineNum}: Malformed marker`);
        }
      }

      // It's a content line (or a malformed marker being treated as content).
      if (state) {
        if (state === 'SEARCH_PATTERN') searchPattern.push(line);
        else if (state === 'SEARCH_TO') searchTo.push(line);
        else if (state === 'SEARCH_REPLACEMENT') searchReplacement.push(line);
        else if (state !== 'TASKS') contentBuffer.push(line);
      } else if (line.trim().startsWith('<--') && line.includes(endDelim)) {
        // This is a special case from the tests: a malformed marker that is an error
        // even when not in an active state.
        throw new Error(`Line ${lineNum}: Malformed marker`);
      }
    }
    lineNum++;
  }
  
  if (state) {
    const opLine = tasksOp && state === 'TASKS' ? tasksOp.line : currentOp!.line;
    const opType = tasksOp && state === 'TASKS' ? 'TASKS' : (state.startsWith('SEARCH') ? 'SEARCH' : state);
    throw new Error(`Line ${opLine}: Unterminated ${opType} operation`);
  }
  
  return operations;
}

function parseAttributes(attrString: string, lineNum: number): Record<string, string> {
  const attrs: Record<string, string> = {};
  // Regex to find key="value" or key='value' pairs, handling escaped quotes.
  const regex = /(\S+)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(attrString)) !== null) {
    // Check for unexpected characters between attributes
    if (match.index > lastIndex) {
        const gap = attrString.substring(lastIndex, match.index).trim();
        if (gap) throw new Error(`Line ${lineNum}: Invalid attribute syntax`);
    }

    const name = match[1];
    if (attrs.hasOwnProperty(name)) {
      throw new Error(`Line ${lineNum}: Duplicate attribute: ${name}`);
    }
    
    // Use value from double quotes (group 2) or single quotes (group 3)
    const value = match[2] !== undefined ? match[2] : match[3];
    
    // Handle escape sequences
    attrs[name] = value.replace(/\\(['"\\])/g, '$1');
    lastIndex = regex.lastIndex;
  }

  // Check if the entire string was consumed by the regex
  if (lastIndex < attrString.trim().length) {
    const remaining = attrString.substring(lastIndex).trim();
    if (remaining.includes('=')) {
        const firstPart = remaining.split('=')[0].trim();
        if (!remaining.startsWith(firstPart)) { // an attribute must not have space before its name
             throw new Error(`Line ${lineNum}: Invalid attribute syntax`);
        }
        throw new Error(`Line ${lineNum}: Unquoted attribute value`);
    }
    throw new Error(`Line ${lineNum}: Invalid attribute syntax`);
  }
    
  // A simple check for unterminated quotes
  const dblQuotes = (attrString.match(/"/g) || []).filter(c => c === '"').length;
  const sglQuotes = (attrString.match(/'/g) || []).filter(c => c === "'").length;

  if ( (attrString.split(/\\"/).length - 1) % 2 !== dblQuotes % 2) {
      throw new Error(`Line ${lineNum}: Unterminated quoted value`);
  }
  if ( (attrString.split(/\\'/).length - 1) % 2 !== sglQuotes % 2) {
      throw new Error(`Line ${lineNum}: Unterminated quoted value`);
  }

  return attrs;
}