import { API_URL } from '../config';

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
}

interface PackageInfo {
  name: string;
  version: string;
}

interface PackageListResult {
  success: boolean;
  packages: PackageInfo[];
  error?: string;
}

class CodeExecutionService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${API_URL}/execute`;
  }

  async executeCode(code: string, language: string = 'python'): Promise<ExecutionResult> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Failed to execute code',
      };
    }
  }

  async getAvailablePackages(): Promise<PackageListResult> {
    try {
      const response = await fetch(`${this.apiUrl}/packages`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        packages: [],
        error: error instanceof Error ? error.message : 'Failed to get package list',
      };
    }
  }

  async testEnvironment(): Promise<ExecutionResult> {
    const testCode = `
import pygame
import numpy as np
import pandas as pd

print("Testing pre-installed packages:")
print(f"Pygame version: {pygame.version.ver}")
print(f"Numpy version: {np.__version__}")
print(f"Pandas version: {pd.__version__}")
    `;

    return this.executeCode(testCode);
  }
}

export const executionService = new CodeExecutionService(); 