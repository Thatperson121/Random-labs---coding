import { Asset } from '../types';

interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
}

class CodeExecutionService {
  private worker: Worker | null = null;
  private isExecuting: boolean = false;

  constructor() {
    // Initialize Web Worker for code execution
    this.worker = new Worker(new URL('../workers/execution.worker.ts', import.meta.url));
    
    this.worker.onmessage = (event) => {
      // Handle execution results
      const { type, data } = event.data;
      if (type === 'executionComplete') {
        this.handleExecutionComplete(data);
      }
    };

    this.worker.onerror = (error) => {
      console.error('Execution worker error:', error);
      this.isExecuting = false;
    };
  }

  async executeCode(asset: Asset): Promise<ExecutionResult> {
    if (!asset.content || this.isExecuting) {
      return {
        output: '',
        error: 'No content to execute or already executing',
        executionTime: 0
      };
    }

    this.isExecuting = true;
    const startTime = performance.now();

    return new Promise((resolve) => {
      if (!this.worker) {
        resolve({
          output: '',
          error: 'Execution worker not initialized',
          executionTime: 0
        });
        return;
      }

      const timeout = setTimeout(() => {
        this.isExecuting = false;
        resolve({
          output: '',
          error: 'Execution timeout',
          executionTime: performance.now() - startTime
        });
      }, 30000); // 30 second timeout

      this.worker.postMessage({
        type: 'execute',
        data: {
          code: asset.content,
          language: asset.metadata?.language || 'javascript'
        }
      });

      const messageHandler = (event: MessageEvent) => {
        const { type, data } = event.data;
        if (type === 'executionComplete') {
          clearTimeout(timeout);
          this.worker?.removeEventListener('message', messageHandler);
          this.isExecuting = false;
          resolve({
            ...data,
            executionTime: performance.now() - startTime
          });
        }
      };

      this.worker.addEventListener('message', messageHandler);
    });
  }

  private handleExecutionComplete(data: ExecutionResult) {
    // Handle execution completion
    console.log('Execution completed:', data);
  }

  stopExecution() {
    if (this.worker) {
      this.worker.postMessage({ type: 'stop' });
      this.isExecuting = false;
    }
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isExecuting = false;
  }
}

export const codeExecutionService = new CodeExecutionService(); 