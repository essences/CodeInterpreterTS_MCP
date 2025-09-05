#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as ts from "typescript";
import { ExecutionManager } from './execution-manager';
import { Logger, LogLevel } from './logger';
import { ServerConfig } from './types';

// Initialize logger
const logger = Logger.getInstance();
logger.setLogLevel(LogLevel.INFO);

// Server configuration
const serverConfig: ServerConfig = {
  maxConcurrentExecutions: 3,
  executionTimeout: 30000, // 30 seconds
  tempDirPrefix: 'mcp-code-interpreter',
  security: {
    enableSandbox: true,
    allowedModules: ['console', 'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number'],
    maxCodeLength: 50000 // 50KB max
  }
};

// Create execution manager
const executionManager = new ExecutionManager(serverConfig);

// Create server instance
const server = new McpServer({
  name: "typescript-javascript-code-interpreter",
  version: "2.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function for consistent error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// Helper function to validate TypeScript code without execution using TypeScript Compiler API
async function validateTypeScriptCode(code: string): Promise<{ valid: boolean; errors?: string[]; warnings?: string[] }> {
  try {
    // Create a virtual file for TypeScript compilation
    const filename = "temp.ts";
    
    // Configure TypeScript compiler options
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.Node16,
      strict: true,
      noEmit: true,
      skipLibCheck: true
    };

    // Create a compiler host
    const host = ts.createCompilerHost(compilerOptions);
    
    // Override the getSourceFile method to provide our code
    const originalGetSourceFile = host.getSourceFile;
    host.getSourceFile = (fileName, languageVersionOrOptions, onError?, shouldCreateNewSourceFile?) => {
      if (fileName === filename) {
        return ts.createSourceFile(fileName, code, ts.ScriptTarget.ES2022, true);
      }
      return originalGetSourceFile.call(host, fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
    };

    // Create a program with our virtual file
    const program = ts.createProgram([filename], compilerOptions, host);
    
    // Get diagnostics
    const diagnostics = ts.getPreEmitDiagnostics(program);
    
    if (diagnostics.length === 0) {
      return { valid: true };
    } else {
      const errors = diagnostics.map(diagnostic => {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          return `Line ${line + 1}, Column ${character + 1}: ${message}`;
        }
        return message;
      });
      
      return {
        valid: false,
        errors: errors
      };
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`TypeScript validation error: ${getErrorMessage(error)}`]
    };
  }
}

// Register TypeScript code execution tool
server.tool(
  "execute-typescript",
  "Execute TypeScript code with security validation",
  {
    code: z.string().describe("TypeScript code to execute")
  },
  async ({ code }) => {
    try {
      logger.info('TypeScript execution requested', { operation: 'execute-typescript' });
      const result = await executionManager.executeCode(code, 'typescript');
      
      let resultText = "";
      
      if (result.output) {
        resultText += `Output:\n${result.output}\n`;
      }
      
      if (result.error) {
        resultText += `Error:\n${result.error}\n`;
      }
      
      resultText += `\nExecution time: ${result.executionTime}ms`;

      return {
        content: [
          {
            type: "text",
            text: resultText || "Execution completed (no output)"
          }
        ]
      };
    } catch (error) {
      logger.error('TypeScript execution failed', { 
        operation: 'execute-typescript',
        error: getErrorMessage(error)
      });
      return {
        content: [
          {
            type: "text",
            text: `Execution failed: ${getErrorMessage(error)}`
          }
        ]
      };
    }
  }
);

// Register JavaScript code execution tool
server.tool(
  "execute-javascript",
  "Execute JavaScript code with security validation",
  {
    code: z.string().describe("JavaScript code to execute")
  },
  async ({ code }) => {
    try {
      logger.info('JavaScript execution requested', { operation: 'execute-javascript' });
      const result = await executionManager.executeCode(code, 'javascript');
      
      let resultText = "";
      
      if (result.output) {
        resultText += `Output:\n${result.output}\n`;
      }
      
      if (result.error) {
        resultText += `Error:\n${result.error}\n`;
      }
      
      resultText += `\nExecution time: ${result.executionTime}ms`;

      return {
        content: [
          {
            type: "text",
            text: resultText || "Execution completed (no output)"
          }
        ]
      };
    } catch (error) {
      logger.error('JavaScript execution failed', { 
        operation: 'execute-javascript',
        error: getErrorMessage(error)
      });
      return {
        content: [
          {
            type: "text",
            text: `Execution failed: ${getErrorMessage(error)}`
          }
        ]
      };
    }
  }
);

// Register TypeScript validation tool
server.tool(
  "validate-typescript",
  "Validate TypeScript code without execution",
  {
    code: z.string().describe("TypeScript code to validate")
  },
  async ({ code }) => {
    try {
      logger.info('TypeScript validation requested', { operation: 'validate-typescript' });
      const result = await validateTypeScriptCode(code);
      
      let resultText = "";
      
      if (result.valid) {
        resultText = "✅ TypeScript validation: Code is valid\n";
      } else {
        resultText = "❌ TypeScript validation: Errors found\n\n";
        if (result.errors && result.errors.length > 0) {
          resultText += "Error details:\n";
          result.errors.forEach((error, index) => {
            resultText += `${index + 1}. ${error}\n`;
          });
        }
      }
      
      if (result.warnings && result.warnings.length > 0) {
        resultText += "\nWarnings:\n";
        result.warnings.forEach((warning, index) => {
          resultText += `${index + 1}. ${warning}\n`;
        });
      }

      return {
        content: [
          {
            type: "text",
            text: resultText
          }
        ]
      };
    } catch (error) {
      logger.error('TypeScript validation failed', { 
        operation: 'validate-typescript',
        error: getErrorMessage(error)
      });
      return {
        content: [
          {
            type: "text",
            text: `Validation failed: ${getErrorMessage(error)}`
          }
        ]
      };
    }
  }
);

// Add server status tool
server.tool(
  "server-status",
  "Get server status and active execution count",
  {},
  async () => {
    const activeCount = executionManager.getActiveExecutionCount();
    const maxConcurrent = serverConfig.maxConcurrentExecutions;
    
    return {
      content: [
        {
          type: "text",
          text: `Server Status:\n- Active executions: ${activeCount}/${maxConcurrent}\n- Security sandbox: ${serverConfig.security.enableSandbox ? 'enabled' : 'disabled'}\n- Execution timeout: ${serverConfig.executionTimeout}ms\n- Max code length: ${serverConfig.security.maxCodeLength} characters`
        }
      ]
    };
  }
);

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await executionManager.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await executionManager.shutdown();
  process.exit(0);
});

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("TypeScript & JavaScript Code Interpreter MCP Server v2.0 running on stdio");
  } catch (error) {
    logger.error('Failed to start server', { error: getErrorMessage(error) });
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error("Fatal error in main()", { error: getErrorMessage(error) });
  process.exit(1);
});
