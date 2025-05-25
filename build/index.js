#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "child_process";
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import * as ts from "typescript";
// Create server instance
const server = new McpServer({
    name: "typescript-javascript-code-interpreter",
    version: "1.1.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Helper function to create temporary TypeScript file and execute it
async function executeTypeScriptCode(code) {
    const tempDir = join(tmpdir(), "ts-code-interpreter");
    const tempFile = join(tempDir, `temp_${Date.now()}.ts`);
    try {
        // Ensure temp directory exists
        if (!existsSync(tempDir)) {
            mkdirSync(tempDir, { recursive: true });
        }
        // Write TypeScript code to temporary file
        writeFileSync(tempFile, code);
        // Execute TypeScript code using tsx
        return new Promise((resolve) => {
            const child = spawn("npx", ["tsx", tempFile], {
                stdio: ["pipe", "pipe", "pipe"],
                shell: true,
                cwd: process.cwd()
            });
            let stdout = "";
            let stderr = "";
            child.stdout?.on("data", (data) => {
                stdout += data.toString();
            });
            child.stderr?.on("data", (data) => {
                stderr += data.toString();
            });
            child.on("close", (code) => {
                // Clean up temporary file
                try {
                    unlinkSync(tempFile);
                }
                catch (cleanupError) {
                    console.error("Failed to cleanup temp file:", cleanupError);
                }
                if (code === 0) {
                    resolve({ output: stdout || "コードが正常に実行されました（出力なし）" });
                }
                else {
                    resolve({
                        output: stdout || "",
                        error: stderr || `プロセスが終了コード ${code} で終了しました`
                    });
                }
            });
            child.on("error", (error) => {
                // Clean up temporary file
                try {
                    unlinkSync(tempFile);
                }
                catch (cleanupError) {
                    console.error("Failed to cleanup temp file:", cleanupError);
                }
                resolve({
                    output: "",
                    error: `実行エラー: ${error.message}`
                });
            });
            // Set timeout for execution (30 seconds)
            setTimeout(() => {
                child.kill();
                try {
                    unlinkSync(tempFile);
                }
                catch (cleanupError) {
                    console.error("Failed to cleanup temp file:", cleanupError);
                }
                resolve({
                    output: "",
                    error: "実行がタイムアウトしました（30秒）"
                });
            }, 30000);
        });
    }
    catch (error) {
        return {
            output: "",
            error: `ファイル作成エラー: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
// Helper function to create temporary JavaScript file and execute it
async function executeJavaScriptCode(code) {
    const tempDir = join(tmpdir(), "js-code-interpreter");
    const tempFile = join(tempDir, `temp_${Date.now()}.js`);
    try {
        // Ensure temp directory exists
        if (!existsSync(tempDir)) {
            mkdirSync(tempDir, { recursive: true });
        }
        // Write JavaScript code to temporary file
        writeFileSync(tempFile, code);
        // Execute JavaScript code using Node.js
        return new Promise((resolve) => {
            const child = spawn("node", [tempFile], {
                stdio: ["pipe", "pipe", "pipe"],
                shell: true,
                cwd: process.cwd()
            });
            let stdout = "";
            let stderr = "";
            child.stdout?.on("data", (data) => {
                stdout += data.toString();
            });
            child.stderr?.on("data", (data) => {
                stderr += data.toString();
            });
            child.on("close", (code) => {
                // Clean up temporary file
                try {
                    unlinkSync(tempFile);
                }
                catch (cleanupError) {
                    console.error("Failed to cleanup temp file:", cleanupError);
                }
                if (code === 0) {
                    resolve({ output: stdout || "コードが正常に実行されました（出力なし）" });
                }
                else {
                    resolve({
                        output: stdout || "",
                        error: stderr || `プロセスが終了コード ${code} で終了しました`
                    });
                }
            });
            child.on("error", (error) => {
                // Clean up temporary file
                try {
                    unlinkSync(tempFile);
                }
                catch (cleanupError) {
                    console.error("Failed to cleanup temp file:", cleanupError);
                }
                resolve({
                    output: "",
                    error: `実行エラー: ${error.message}`
                });
            });
            // Set timeout for execution (30 seconds)
            setTimeout(() => {
                child.kill();
                try {
                    unlinkSync(tempFile);
                }
                catch (cleanupError) {
                    console.error("Failed to cleanup temp file:", cleanupError);
                }
                resolve({
                    output: "",
                    error: "実行がタイムアウトしました（30秒）"
                });
            }, 30000);
        });
    }
    catch (error) {
        return {
            output: "",
            error: `ファイル作成エラー: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
// Helper function to validate TypeScript code without execution using TypeScript Compiler API
async function validateTypeScriptCode(code) {
    try {
        // Create a virtual file for TypeScript compilation
        const filename = "temp.ts";
        // Configure TypeScript compiler options
        const compilerOptions = {
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
        host.getSourceFile = (fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile) => {
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
        }
        else {
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
    }
    catch (error) {
        return {
            valid: false,
            errors: [`型チェック中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`]
        };
    }
}
// Register TypeScript code execution tool
server.tool("execute-typescript", "TypeScriptコードを実行します", {
    code: z.string().describe("実行するTypeScriptコード")
}, async ({ code }) => {
    try {
        const result = await executeTypeScriptCode(code);
        let resultText = "";
        if (result.output) {
            resultText += `出力:\n${result.output}\n`;
        }
        if (result.error) {
            resultText += `エラー:\n${result.error}\n`;
        }
        return {
            content: [
                {
                    type: "text",
                    text: resultText || "実行完了（出力なし）"
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `実行中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
                }
            ]
        };
    }
});
// Register JavaScript code execution tool
server.tool("execute-javascript", "JavaScriptコードを実行します", {
    code: z.string().describe("実行するJavaScriptコード")
}, async ({ code }) => {
    try {
        const result = await executeJavaScriptCode(code);
        let resultText = "";
        if (result.output) {
            resultText += `出力:\n${result.output}\n`;
        }
        if (result.error) {
            resultText += `エラー:\n${result.error}\n`;
        }
        return {
            content: [
                {
                    type: "text",
                    text: resultText || "実行完了（出力なし）"
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `実行中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
                }
            ]
        };
    }
});
// Register TypeScript validation tool
server.tool("validate-typescript", "TypeScriptコードの型チェックを行います（実行はしません）", {
    code: z.string().describe("型チェックするTypeScriptコード")
}, async ({ code }) => {
    try {
        const result = await validateTypeScriptCode(code);
        let resultText = "";
        if (result.valid) {
            resultText = "✅ 型チェック結果: コードは正常です\n";
        }
        else {
            resultText = "❌ 型チェック結果: エラーが見つかりました\n\n";
            if (result.errors && result.errors.length > 0) {
                resultText += "エラー詳細:\n";
                result.errors.forEach((error, index) => {
                    resultText += `${index + 1}. ${error}\n`;
                });
            }
        }
        if (result.warnings && result.warnings.length > 0) {
            resultText += "\n警告:\n";
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
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `型チェック中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
                }
            ]
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("TypeScript & JavaScript Code Interpreter MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
