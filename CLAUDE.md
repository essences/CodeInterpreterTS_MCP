# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Run
- `npm run build` - Compile TypeScript to JavaScript and make executable
- `npm run dev` - Run in development mode using tsx
- `npm run start` - Run the built server
- `npm run clean` - Remove build artifacts and temporary files

### Code Quality
- `npm run lint` - Run ESLint on source code
- `npm run lint:fix` - Fix ESLint issues automatically

### Testing
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode  
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:security` - Run security-specific tests
- `npm run test:mcp` - Test basic MCP communication
- `npm run test:enhanced` - Test advanced TypeScript/JavaScript features
- `npm run test:communication` - Test MCP protocol communication
- `npm run test:all` - Run all test suites

### Excel Testing Utilities
- `npm run excel:create` - Create test Excel files
- `npm run excel:read` - Test Excel reading functionality

## Architecture

### Core Components
- **Main Server** (`src/index.ts`) - MCP server implementation with four main tools:
  - `execute-typescript` - Execute TypeScript code using tsx with security validation
  - `execute-javascript` - Execute JavaScript code using Node.js with security validation
  - `validate-typescript` - Type-check TypeScript code without execution
  - `server-status` - Get current server status and execution metrics

- **Execution Manager** (`src/execution-manager.ts`) - Centralized code execution with:
  - Concurrent execution limiting (max 3 simultaneous)
  - Security analysis integration
  - Automatic cleanup and error handling
  - Execution timeout management

- **Security Layer** (`src/security/`) - Comprehensive security system:
  - `secure-filesystem.ts` - Secure file system operations with path validation
  - `path-validator.ts` - Path validation and normalization with security rules
  - `code-analyzer.ts` - Static code analysis with tiered security levels (dangerous vs restricted)

- **Logging System** (`src/logger.ts`) - Structured logging with:
  - Multiple log levels (ERROR, WARN, INFO, DEBUG)
  - Contextual information tracking
  - Execution metrics and performance monitoring

### Key Features
- **Enhanced Security**: Multi-layered security with static analysis, path validation, and sandboxed execution
- **Concurrent Execution Control**: Rate limiting with maximum 3 simultaneous executions
- **Improved Error Handling**: Consistent error messages and comprehensive logging
- **Memory Management**: Automatic cleanup with safe file deletion and process management
- **Type Safety**: Full TypeScript integration with compiler API validation
- **Performance Monitoring**: Execution time tracking and resource usage metrics
- **Graceful Shutdown**: Proper cleanup of active executions on server termination

### Dependencies
- **Runtime**: Node.js 18+, TypeScript 5.x
- **MCP**: @modelcontextprotocol/sdk for client communication
- **Execution**: tsx for TypeScript, native Node.js for JavaScript
- **Validation**: TypeScript Compiler API, Zod for schema validation
- **Security**: Babel parser for static code analysis
- **Code Quality**: ESLint for linting, Jest with ts-jest for testing
- **Data**: xlsx for Excel files (if needed for data processing)

### File Structure
- `src/index.ts` - Main server implementation and tool registration
- `src/execution-manager.ts` - Centralized execution management with security
- `src/logger.ts` - Structured logging system
- `src/types.ts` - TypeScript type definitions and interfaces
- `src/security/` - Security components for safe code execution
- `build/` - Compiled JavaScript output
- `tests/` - Comprehensive test suite with security and integration tests
- `examples/` - Sample data files and test datasets
- `config/` - Configuration files including Claude Desktop setup

### Testing Framework
- **Jest** configured with TypeScript support
- Test files in `tests/` directory with `.test.ts` extension
- 30-second timeout for long-running tests
- Coverage collection from all `src/` TypeScript files

### Enhanced Security Model
- **Multi-tier Security Analysis**: 
  - Dangerous modules (child_process, vm, cluster) - blocked completely
  - Restricted modules (fs, http, os) - generate warnings but may be blocked by additional checks
- **Sandboxed Execution**: All code runs in isolated temporary directories with automatic cleanup
- **Path Validation**: Comprehensive validation prevents directory traversal and unauthorized access
- **Execution Controls**: 30-second timeout, concurrent execution limits (max 3), resource monitoring
- **Static Analysis**: Pre-execution code analysis detects obfuscation, eval usage, and malicious patterns
- **Graceful Error Handling**: All errors are caught and logged with context for debugging

### MCP Integration
This server implements the Model Context Protocol (MCP) to provide code execution capabilities to Claude Desktop. The server exposes tools for TypeScript/JavaScript execution and validation through a standardized interface.