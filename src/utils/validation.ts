import yaml from 'js-yaml';

export interface ValidationError {
  message: string;
  line: number;
  column: number;
  snippet?: string;
}

export const validateJson = (input: string): ValidationError | null => {
  if (!input.trim()) return null;
  try {
    JSON.parse(input);
    return null;
  } catch (e) {
    const msg = (e as Error).message;
    // Extract line/column from error message (browser dependent usually)
    // Chrome: "Unexpected token '}' at line 2 column 5"
    // Firefox: "JSON.parse: unexpected character at line 1 column 10"
    const lineExec = /line (\d+)/i.exec(msg);
    const colExec = /column (\d+)/i.exec(msg);
    
    return {
      message: msg.replace(/at line \d+ column \d+/i, '').trim(),
      line: lineExec ? Number.parseInt(lineExec[1], 10) : 1,
      column: colExec ? Number.parseInt(colExec[1], 10) : 1,
    };
  }
};

export const validateYaml = (input: string): ValidationError | null => {
  if (!input.trim()) return null;
  try {
    yaml.load(input);
    return null;
  } catch (e: any) {
    if (e.mark) {
      return {
        message: e.reason || e.message,
        line: e.mark.line + 1,
        column: e.mark.column + 1,
        snippet: e.mark.snippet,
      };
    }
    return {
      message: (e as Error).message,
      line: 1,
      column: 1,
    };
  }
};

export const validateCurl = (input: string): ValidationError | null => {
  if (!input.trim()) return null;
  
  const trimmed = input.trim();
  if (!trimmed.toLowerCase().startsWith('curl')) {
    return { message: "Command must start with 'curl'", line: 1, column: 1 };
  }

  // Check for unclosed quotes
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let lastChar = '';
  
  const lines = input.split('\n');
  for (const [l, line] of lines.entries()) {
    for (const char of line) {
      if (char === "'" && lastChar !== '\\' && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && lastChar !== '\\' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }
      lastChar = char;
    }
    // If we're not using backslash at end of line, quotes should probably be closed
    if (!line.trim().endsWith('\\') && (inSingleQuote || inDoubleQuote)) {
       return { 
         message: `Unclosed ${inSingleQuote ? 'single' : 'double'} quote`, 
         line: l + 1, 
         column: line.length 
       };
    }
  }

  if (inSingleQuote || inDoubleQuote) {
    return { 
      message: "Unclosed quotes at end of command", 
      line: lines.length, 
      column: lines.at(-1)?.length || 0 
    };
  }

  return null;
};
