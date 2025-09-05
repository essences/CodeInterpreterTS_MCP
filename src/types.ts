export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  tempFilePath?: string;
}

export interface ServerConfig {
  maxConcurrentExecutions: number;
  executionTimeout: number;
  tempDirPrefix: string;
  security: {
    enableSandbox: boolean;
    allowedModules: string[];
    maxCodeLength: number;
  };
}

export interface LogContext {
  operation?: string;
  tempFile?: string;
  executionTime?: number;
  error?: string;
  warnings?: string[];
  executionId?: string;
}