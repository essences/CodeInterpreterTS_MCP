<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an MCP Server project written in TypeScript that provides a code interpreter for executing TypeScript code.

You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt

## Project Structure
- This is a TypeScript MCP server that implements a code interpreter
- The server provides tools to execute and validate TypeScript code
- Uses tsx for TypeScript execution and the TypeScript compiler for validation
- Implements security measures like execution timeouts and temporary file cleanup

## Key Features
- `execute-typescript`: Executes TypeScript code and returns output/errors
- `validate-typescript`: Performs type checking without execution
- Secure temporary file handling
- 30-second execution timeout for safety

## Development Guidelines
- Follow TypeScript best practices
- Ensure proper error handling and cleanup
- Use the MCP SDK patterns for tool registration
- Maintain security considerations for code execution
