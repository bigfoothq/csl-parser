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
  
  // Escape special regex characters
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startEscaped = escapeRegex(startDelim);
  const endEscaped = escapeRegex(endDelim);
  
  // Build regex for markers: ^<---(\w+)(\s+(.*))?--->$
  const markerRegex = new RegExp(`^${startEscaped}(\\w+)(\\s+(.*))?${endEscaped}$`);
  
  // Helper to check if an operation is valid for current state
  const isValidOperationForState = (opName: string, currentState: string | null): boolean => {
    if (!currentState) {
      // At top level - only operation starters are valid
      return ['WRITE', 'RUN', 'SEARCH', 'TASKS'].includes(opName);
    } else if (currentState === 'TASKS') {
      // In TASKS - operation starters and END are valid
      return ['WRITE', 'RUN', 'SEARCH', 'END'].includes(opName);
    } else if (currentState === 'WRITE' || currentState === 'RUN') {
      return opName === 'END';
    } else if (currentState === 'SEARCH_PATTERN') {
      return ['TO', 'REPLACE', 'END'].includes(opName);
    } else if (currentState === 'SEARCH_TO') {
      return opName === 'REPLACE';
    } else if (currentState === 'SEARCH_REPLACEMENT') {
      return opName === 'END';
    }
    return false;
  };
  
  const lines = text.split(/\r\n|\r|\n/);
  const operations: Operation[] = [];
  
  let lineNum = 1;
  let state: string | null = null;
  let currentOp: Operation | null = null;
  let contentBuffer: string[] = [];
  let insideTasks = false;
  let tasksOp: Operation | null = null;
  
  // For SEARCH operations
  let searchPattern: string[] = [];
  let searchTo: string[] = [];
  let searchReplacement: string[] = [];
  
  for (const line of lines) {
    // Check if this could be a marker
    let isMarker = false;
    let markerMatch: RegExpMatchArray | null = null;
    
    if (line.startsWith(startDelim)) {
      markerMatch = line.match(markerRegex);
      
      if (markerMatch) {
        const opName = markerMatch[1];
        
        // Determine if this is a valid state-transition marker for current state
        if (!state || state === 'TASKS') {
          // Not in content block - all valid markers accepted
          isMarker = true;
        } else if (state === 'WRITE' || state === 'RUN') {
          // Only END is valid
          isMarker = opName === 'END';
        } else if (state === 'SEARCH_PATTERN') {
          // TO, REPLACE, END are valid
          isMarker = ['TO', 'REPLACE', 'END'].includes(opName);
        } else if (state === 'SEARCH_TO') {
          // Only REPLACE is valid
          isMarker = opName === 'REPLACE';
        } else if (state === 'SEARCH_REPLACEMENT') {
          // Only END is valid
          isMarker = opName === 'END';
        }
      } else {
        // Line starts with delimiter but doesn't match pattern
        // Check if this looks like a marker with trailing content
        // Build a regex that matches up to and including the end delimiter
        const partialMarkerRegex = new RegExp(`^${startEscaped}(\\w+)(\\s+(.*))?${endEscaped}`);
        const partialMatch = line.match(partialMarkerRegex);
        
        if (partialMatch) {
          const opName = partialMatch[1];
          
          // Check if this would be a valid state-transition marker for current state
          const wouldBeValidMarker = isValidOperationForState(opName, state);
          
          // If it would be a valid marker but has trailing content, that's an error
          if (wouldBeValidMarker && line.length > partialMatch[0].length) {
            throw new Error(`Line ${lineNum}: Content not allowed on marker line`);
          }
        }
        
        if (!state || state === 'TASKS') {
          // At top level - this is an error
          throw new Error(`Line ${lineNum}: Malformed marker`);
        }
        // In content block - treat as literal content
      }
    }
    
    if (isMarker && markerMatch) {
      const match = markerMatch;
      
      const opName = match[1];
      const attrString = match[3] || '';
      
      // Handle END marker
      if (opName === 'END') {
        if (!state || !currentOp) {
          throw new Error(`Line ${lineNum}: END marker without active operation`);
        }
        
        // END markers cannot have attributes
        if (attrString.trim()) {
          throw new Error(`Line ${lineNum}: END marker cannot have attributes`);
        }
        
        // Complete current operation
        if (state === 'WRITE' || state === 'RUN') {
          currentOp.content = contentBuffer.join('\n');
        } else if (state === 'SEARCH_REPLACEMENT') {
          currentOp.pattern = searchPattern.join('\n');
          if (searchTo.length > 0) {
            currentOp.to = searchTo.join('\n');
          }
          currentOp.replacement = searchReplacement.join('\n');
        } else if (state === 'TASKS' && currentOp === tasksOp) {
          // Ending TASKS block
          operations.push(tasksOp!);
          tasksOp = null;
          insideTasks = false;
          state = null;
          currentOp = null;
          contentBuffer = [];
          searchPattern = [];
          searchTo = [];
          searchReplacement = [];
          lineNum++;
          continue;
        }
        
        // If inside TASKS, add to operations array
        if (insideTasks && state !== 'TASKS' && tasksOp) {
          // Ending a nested operation inside TASKS
          tasksOp.operations!.push(currentOp);
          state = 'TASKS';
          currentOp = tasksOp; // Restore currentOp to TASKS
        } else if (!insideTasks) {
          // Ending a top-level operation
          operations.push(currentOp);
          state = null;
          currentOp = null;
        }
        contentBuffer = [];
        searchPattern = [];
        searchTo = [];
        searchReplacement = [];
      }
      // Handle operation markers
      else if (['WRITE', 'RUN', 'SEARCH', 'TASKS'].includes(opName)) {
        // Check for TASKS nesting
        if (opName === 'TASKS' && insideTasks) {
          throw new Error(`Line ${lineNum}: TASKS cannot be nested`);
        }
        
        // Check if operation is valid in current context
        if (state !== null && state !== 'TASKS') {
          throw new Error(`Line ${lineNum}: ${opName} marker not valid in ${state.replace(/_/g, ' ')} operation`);
        }
        
        currentOp = { type: opName as Operation['type'], line: lineNum };
        
        // Parse attributes if present
        if (attrString) {
          const attrs = parseAttributes(attrString, lineNum);
          Object.assign(currentOp, attrs);
        }
        
        if (opName === 'TASKS') {
          currentOp.operations = [];
          tasksOp = currentOp;
          insideTasks = true;
          state = 'TASKS';
        } else {
          state = opName === 'SEARCH' ? 'SEARCH_PATTERN' : opName;
        }
      }
      // Handle TO marker (only valid in SEARCH)
      else if (opName === 'TO') {
        if (state !== 'SEARCH_PATTERN') {
          const stateStr = state === null ? 'null' : state.replace(/_/g, ' ');
          throw new Error(`Line ${lineNum}: TO marker not valid in ${stateStr} operation`);
        }
        state = 'SEARCH_TO';
      }
      // Handle REPLACE marker (only valid in SEARCH)
      else if (opName === 'REPLACE') {
        if (state !== 'SEARCH_PATTERN' && state !== 'SEARCH_TO') {
          const stateStr = state === null ? 'null' : state.replace(/_/g, ' ');
          throw new Error(`Line ${lineNum}: REPLACE marker not valid in ${stateStr} operation`);
        }
        state = 'SEARCH_REPLACEMENT';
      }
      else {
        throw new Error(`Line ${lineNum}: Unknown operation: ${opName}`);
      }
    } else {
      // Not a marker - treat as content if in content state
      if (state && currentOp && state !== 'TASKS') {
        if (state === 'SEARCH_PATTERN') {
          searchPattern.push(line);
        } else if (state === 'SEARCH_TO') {
          searchTo.push(line);
        } else if (state === 'SEARCH_REPLACEMENT') {
          searchReplacement.push(line);
        } else {
          contentBuffer.push(line);
        }
      } else if ((!state || state === 'TASKS') && line.startsWith(startDelim)) {
        // At top level or in TASKS, and line starts with delimiter but wasn't recognized as valid marker
        throw new Error(`Line ${lineNum}: Malformed marker`);
      }
    }
    
    lineNum++;
  }
  
  // Check for unterminated operations
  if (state && currentOp) {
    // Get original operation name for error message
    let opType = state;
    if (state.startsWith('SEARCH')) {
      opType = 'SEARCH';
    } else if (state === 'TASKS' && tasksOp) {
      throw new Error(`Line ${tasksOp.line}: Unterminated TASKS operation`);
    }
    throw new Error(`Line ${currentOp.line}: Unterminated ${opType} operation`);
  }
  
  return operations;
}

function parseAttributes(attrString: string, lineNum: number): Record<string, string> {
  const attrs: Record<string, string> = {};
  let i = 0;
  
  while (i < attrString.length) {
    // Skip whitespace
    while (i < attrString.length && /\s/.test(attrString[i])) {
      i++;
    }
    
    if (i >= attrString.length) break;
    
    // Read attribute name
    const nameStart = i;
    while (i < attrString.length && !/[\s=]/.test(attrString[i])) {
      i++;
    }
    
    if (i === nameStart) {
      throw new Error(`Line ${lineNum}: Invalid attribute syntax`);
    }
    
    const name = attrString.slice(nameStart, i);
    
    // Skip whitespace
    while (i < attrString.length && /\s/.test(attrString[i])) {
      i++;
    }
    
    // Expect equals sign
    if (i >= attrString.length || attrString[i] !== '=') {
      throw new Error(`Line ${lineNum}: Expected '=' after attribute name`);
    }
    i++; // skip =
    
    // Skip whitespace
    while (i < attrString.length && /\s/.test(attrString[i])) {
      i++;
    }
    
    // Read quoted value
    if (i >= attrString.length) {
      throw new Error(`Line ${lineNum}: Missing attribute value`);
    }
    
    const quote = attrString[i];
    if (quote !== '"' && quote !== "'") {
      throw new Error(`Line ${lineNum}: Unquoted attribute value`);
    }
    i++; // skip opening quote
    
    // Read value with escape handling
    let value = '';
    while (i < attrString.length) {
      const char = attrString[i];
      
      if (char === '\\' && i + 1 < attrString.length) {
        const nextChar = attrString[i + 1];
        if (nextChar === quote || nextChar === '\\') {
          value += nextChar;
          i += 2;
        } else {
          // Other escapes are literal
          value += char;
          i++;
        }
      } else if (char === quote) {
        i++; // skip closing quote
        break;
      } else {
        value += char;
        i++;
      }
    }
    
    // Check if we found closing quote
    if (i > attrString.length || attrString[i - 1] !== quote) {
      throw new Error(`Line ${lineNum}: Unterminated quoted value`);
    }
    
    // Check for duplicate attributes
    if (attrs.hasOwnProperty(name)) {
      throw new Error(`Line ${lineNum}: Duplicate attribute: ${name}`);
    }
    
    attrs[name] = value;
  }
  
  return attrs;
}