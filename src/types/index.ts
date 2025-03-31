export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  friends: string[];
}

export interface ExecutionResult {
  output?: string;
  error?: string;
}

export interface PackageInfo {
  name: string;
  version: string;
}

export interface PackageListResult {
  packages: PackageInfo[];
} 