importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');

interface ExecutionMessage {
  type: 'execute';
  data: {
    code: string;
    language: string;
    requestId: string;
    input?: string;
    args?: string[];
  };
}

interface StopMessage {
  type: 'stop';
}

type WorkerMessage = ExecutionMessage | StopMessage;

let pyodide: any = null;
let isExecuting = false;

async function initPyodide() {
  if (!pyodide) {
    pyodide = await loadPyodide();

    // Load common modules
    await pyodide.loadPackage(['micropip']);
    const micropip = pyodide.pyimport('micropip');
    await micropip.install(['requests']);
    await pyodide.runPythonAsync(`
import sys
import io

# Redirect stdout and stderr
class Capturing(list):
    def __enter__(self):
        self._stdout = sys.stdout
        sys.stdout = self._stringio = io.StringIO()
        return self
    def __exit__(self, *args):
        self.extend(self._stringio.getvalue().splitlines())
        del self._stringio    # free up some memory
        sys.stdout = self._stdout
`);
  }
  return pyodide;
}

//Execute Javascript
async function executeJavaScript(code: string, input: string, args: string[]): Promise<any> {
    const selfGlobal = self as any;
    selfGlobal.input = input;
    selfGlobal.args = args;
    selfGlobal.console = {
        log: (...data: any[]) => {
            self.postMessage({ type: 'output', data: data.map(String).join(' ') });
        },
        error: (...data: any[]) => {
            self.postMessage({ type: 'error', data: data.map(String).join(' ') });
        },
    };
    try {
        const result = await eval(code);
        return { result };
    } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
    }
}

async function executePython(code: string, input: string, args: string[]) {
    const pyodideInstance = await initPyodide();
    const { stdout } = pyodideInstance.globals.get('Capturing')();
    let result;
    let error;
    pyodideInstance.globals.set('input', input);
    pyodideInstance.globals.set('args', args);
    
    try {
        result = await pyodideInstance.runPythonAsync(`
import sys
import io
from js import input, args

class Capturing(list):
    def __enter__(self):
        self._stdout = sys.stdout
        sys.stdout = self._stringio = io.StringIO()
        return self
    def __exit__(self, *args):
        self.extend(self._stringio.getvalue().splitlines())
        del self._stringio
        sys.stdout = self._stdout

${code}
`);
    } catch (err) {
        error = err.toString();
    } finally {
      
        let outputLines = stdout.toJs();
        for (const line of outputLines) {
            self.postMessage({ type: 'output', data: line });
        }
    }

    return { result, error };
}


//executeTypescript
async function executeTypeScript(code: string, input: string, args: string[]): Promise<any> {
    try {
        // Dynamically load the TypeScript compiler
        const response = await fetch('https://unpkg.com/typescript@latest/lib/typescript.js');
        const tsCode = await response.text();
        const ts = eval(tsCode);

        // Transpile TypeScript to JavaScript
        const result = ts.transpileModule(code, {
            compilerOptions: {
                target: 'ES2020',
                module: 'ES2020',
            },
        });

        return await executeJavaScript(result.outputText, input, args);
    } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
    }
}

async function executeCode(code: string, language: string, input: string, args: string[]): Promise<any> {
    switch (language) {
        case 'javascript':
            return executeJavaScript(code, input, args);
        case 'python':
            return executePython(code, input, args);
        case 'typescript':
            return executeTypeScript(code, input, args);
        default:
            return { error: 'Unsupported language' };
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
    const { code, language, requestId, input, args } = message.data;

    try {
      const result = await executeCode(code, language.toLowerCase(), input ?? "", args ?? []);
      self.postMessage({
        type: 'executionComplete',
        data: result,
        requestId,
      });
    } catch (error) {
      self.postMessage({
        type: 'executionComplete',
        data: {
            output: '',
            error: error instanceof Error ? error.message : 'Unknown error',
        },
        requestId,
      });
    } finally {
      isExecuting = false;
    }
  }
}; 