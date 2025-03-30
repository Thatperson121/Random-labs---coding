importScripts('https://cdnjs.cloudflare.com/ajax/libs/pyodide/0.24.1/pyodide.js');

interface ExecutionMessage {
  type: 'execute';
  data: {
    code: string;
    language: string;
  };
}

interface StopMessage {
  type: 'stop';
}

type WorkerMessage = ExecutionMessage | StopMessage;

let pyodide: any = null;
let isExecuting = false;

// Initialize Pyodide for Python execution
async function initPyodide() {
  if (!pyodide) {
    pyodide = await loadPyodide();
  }
  return pyodide;
}

// Execute JavaScript code
async function executeJavaScript(code: string): Promise<{ output: string; error?: string }> {
  try {
    // Create a sandboxed environment
    const sandbox = {
      console: {
        log: (...args: any[]) => {
          self.postMessage({
            type: 'output',
            data: args.map(arg => String(arg)).join(' ')
          });
        },
        error: (...args: any[]) => {
          self.postMessage({
            type: 'error',
            data: args.map(arg => String(arg)).join(' ')
          });
        }
      }
    };

    // Execute code in sandbox
    const fn = new Function('console', code);
    fn(sandbox.console);

    return { output: '' };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute Python code
async function executePython(code: string): Promise<{ output: string; error?: string }> {
  try {
    const pyodide = await initPyodide();
    
    // Set up Python environment
    await pyodide.loadPackagesFromImports(code);
    
    // Redirect Python's stdout
    pyodide.runPython(`
      import sys
      import io
      sys.stdout = io.StringIO()
      ${code}
      sys.stdout.getvalue()
    `);
    
    return { output: '' };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Execute TypeScript code
async function executeTypeScript(code: string): Promise<{ output: string; error?: string }> {
  try {
    // Transpile TypeScript to JavaScript
    const jsCode = await self.importScripts('https://unpkg.com/typescript@latest/lib/typescript.js');
    const result = self.ts.transpileModule(code, {
      compilerOptions: {
        target: 'ES2020',
        module: 'ES2020'
      }
    });
    
    // Execute the transpiled JavaScript
    return executeJavaScript(result.outputText);
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Handle messages from the main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;
  
  if (message.type === 'stop') {
    isExecuting = false;
    return;
  }
  
  if (message.type === 'execute' && !isExecuting) {
    isExecuting = true;
    const { code, language } = message.data;
    
    try {
      let result;
      
      switch (language.toLowerCase()) {
        case 'python':
          result = await executePython(code);
          break;
        case 'typescript':
          result = await executeTypeScript(code);
          break;
        case 'javascript':
        default:
          result = await executeJavaScript(code);
      }
      
      self.postMessage({
        type: 'executionComplete',
        data: result
      });
    } catch (error) {
      self.postMessage({
        type: 'executionComplete',
        data: {
          output: '',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      isExecuting = false;
    }
  }
}; 