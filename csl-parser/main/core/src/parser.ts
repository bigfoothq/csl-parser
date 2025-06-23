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
    console.log(`Line ${lineNum}: "${line}"`);
    console.log(`  State: ${state}, insideTasks: ${insideTasks}, currentOp: ${currentOp ? currentOp.type : 'null'}`);
    
    // Check if line starts with delimiter
    if (line.startsWith(startDelim)) {
      const match = line.match(markerRegex);
      
      if (!match) {
        // A line starting with the delimiter that doesn't match the regex is either
        // content (if inside an op and not otherwise an error) or an error.
        
        // This is always an error: extra content on the same line as a marker-like sequence.
        const trimmed = line.trim();
        if (trimmed.includes(endDelim) && !trimmed.endsWith(endDelim)) {
          throw new Error(`Line ${lineNum}: Content not allowed on marker line`);
        }

        if (state) { // Inside an operation, other malformations are treated as content.
          if (state === 'SEARCH_PATTERN') { searchPattern.push(line); }
          else if (state === 'SEARCH_TO') { searchTo.push(line); }
          else if (state === 'SEARCH_REPLACEMENT') { searchReplacement.push(line); }
          else { contentBuffer.push(line); }
          lineNum++;
          continue;
        } else { // Outside an operation, any malformed marker is a syntax error.
          throw new Error(`Line ${lineNum}: Malformed marker`);
        }
      }
      
      const opName = match[1];
      const attrString = match[3] || '';
      
      // Handle END marker
      if (opName === 'END') {
        console.log(`  Processing END marker:`);
        console.log(`    state: ${state}`);
        console.log(`    currentOp: ${currentOp ? currentOp.type : 'null'}`);
        console.log(`    insideTasks: ${insideTasks}`);
        console.log(`    tasksOp: ${tasksOp ? tasksOp.type : 'null'}`);
        
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
          console.log(`    Ending TASKS block`);
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
          console.log(`    Adding ${currentOp.type} to TASKS operations`);
          tasksOp.operations!.push(currentOp);
          state = 'TASKS';
          currentOp = tasksOp; // Restore currentOp to TASKS
          console.log(`    State changed to: ${state}, currentOp restored to TASKS`);
        } else if (!insideTasks) {
          // Ending a top-level operation
          console.log(`    Adding ${currentOp.type} to top-level operations`);
          operations.push(currentOp);
          state = null;
          currentOp = null;
          console.log(`    State changed to: ${state}`);
        }
        contentBuffer = [];
        searchPattern = [];
        searchTo = [];
        searchReplacement = [];
        console.log(`    After END: state=${state}, currentOp=${currentOp}`);
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
    }
    else {
      // Content line - special handling for state-transition markers in content
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