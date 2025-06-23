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
  
  // For SEARCH operations
  let searchPattern: string[] = [];
  let searchTo: string[] = [];
  let searchReplacement: string[] = [];
  
  for (const line of lines) {
    console.log(`Processing line ${lineNum}: "${line}"`);
    // Check if line starts with delimiter
    if (line.startsWith(startDelim)) {
      const match = line.match(markerRegex);
      
      if (!match) {
        throw new Error(`Line ${lineNum}: Malformed marker`);
      }
      
      const opName = match[1];
      const attrString = match[3] || '';
      console.log(`Line ${lineNum}: Matched marker opName="${opName}", attrString="${attrString}"`);
      
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
        }
        
        operations.push(currentOp);
        state = null;
        currentOp = null;
        contentBuffer = [];
        searchPattern = [];
        searchTo = [];
        searchReplacement = [];
      }
      // Handle operation markers
      else if (['WRITE', 'RUN', 'SEARCH', 'TASKS'].includes(opName)) {
        if (state !== null) {
          throw new Error(`Line ${lineNum}: ${opName} marker not valid in ${state} operation`);
        }
        
        currentOp = { type: opName as Operation['type'], line: lineNum };
        
        // Parse attributes if present
        if (attrString) {
          const attrs = parseAttributes(attrString, lineNum);
          Object.assign(currentOp, attrs);
        }
        
        state = opName === 'SEARCH' ? 'SEARCH_PATTERN' : opName;
        console.log(`Line ${lineNum}: Set state to ${state} for operation ${opName}`);
      }
      // Handle TO marker (only valid in SEARCH)
      else if (opName === 'TO') {
        if (state !== 'SEARCH_PATTERN') {
          const stateStr = state === null ? 'null' : state.replace('_', ' ');
          throw new Error(`Line ${lineNum}: TO marker not valid in ${stateStr} operation`);
        }
        state = 'SEARCH_TO';
      }
      // Handle REPLACE marker (only valid in SEARCH)
      else if (opName === 'REPLACE') {
        if (state !== 'SEARCH_PATTERN' && state !== 'SEARCH_TO') {
          const stateStr = state === null ? 'null' : state.replace('_', ' ');
          throw new Error(`Line ${lineNum}: REPLACE marker not valid in ${stateStr} operation`);
        }
        state = 'SEARCH_REPLACEMENT';
      }
      else {
        throw new Error(`Line ${lineNum}: Unknown operation: ${opName}`);
      }
    }
    else {
      // Content line
      if (state && currentOp) {
        contentBuffer.push(line);
      }
    }
    
    lineNum++;
  }
  
  // Check for unterminated operations
  if (state && currentOp) {
    throw new Error(`Line ${currentOp.line}: Unterminated ${state} operation`);
  }
  
  return operations;
}

function parseAttributes(attrString: string, lineNum: number): Record<string, string> {
  const attrs: Record<string, string> = {};
  
  // Simple regex for now - just handle file="value" pattern
  const attrRegex = /(\S+)\s*=\s*"([^"]*)"/g;
  let match;
  
  while ((match = attrRegex.exec(attrString)) !== null) {
    const [, key, value] = match;
    attrs[key] = value;
  }
  
  return attrs;
}