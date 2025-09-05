"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionManager = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const logger_1 = require("./logger");
const secure_filesystem_1 = require("./security/secure-filesystem");
const code_analyzer_1 = require("./security/code-analyzer");
class ExecutionManager {
    config;
    activeExecutions = new Map();
    executionCount = 0;
    logger = logger_1.Logger.getInstance();
    secureFileSystem;
    constructor(config) {
        this.config = config;
        const securityConfig = {
            enabled: config.security.enableSandbox,
            allowedDirectories: [(0, os_1.tmpdir)()],
            forbiddenDirectories: ['/etc', '/usr', '/System', '/bin', '/sbin'],
            restrictToHome: false,
            allowTempDir: true,
            blockParentAccess: true,
            maxDepth: 10,
            allowedExtensions: ['.ts', '.js', '.json', '.txt']
        };
        this.secureFileSystem = new secure_filesystem_1.SecureFileSystem(securityConfig);
    }
    async executeCode(code, language) {
        if (this.executionCount >= this.config.maxConcurrentExecutions) {
            throw new Error('Maximum concurrent executions reached. Please try again later.');
        }
        if (code.length > this.config.security.maxCodeLength) {
            throw new Error(`Code length exceeds maximum allowed size of ${this.config.security.maxCodeLength} characters`);
        }
        // Security analysis
        if (this.config.security.enableSandbox) {
            const securityResult = await (0, code_analyzer_1.analyzeCodeSafety)(code);
            if (!securityResult.safe) {
                throw new Error(`Security check failed: ${securityResult.issues.join(', ')}`);
            }
            if (securityResult.warnings.length > 0) {
                this.logger.warn('Code analysis warnings', {
                    operation: 'security-check',
                    warnings: securityResult.warnings
                });
            }
        }
        const startTime = Date.now();
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            this.executionCount++;
            const result = await this.runCode(code, language, executionId);
            result.executionTime = Date.now() - startTime;
            this.logger.info('Code execution completed', {
                operation: 'execute',
                executionTime: result.executionTime
            });
            return result;
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.logger.error('Code execution failed', {
                operation: 'execute',
                executionTime,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
        finally {
            this.executionCount--;
            this.activeExecutions.delete(executionId);
        }
    }
    async runCode(code, language, executionId) {
        const tempDir = (0, path_1.join)((0, os_1.tmpdir)(), this.config.tempDirPrefix);
        const extension = language === 'typescript' ? '.ts' : '.js';
        const tempFile = (0, path_1.join)(tempDir, `${executionId}${extension}`);
        try {
            // Ensure temp directory exists
            if (!(0, fs_1.existsSync)(tempDir)) {
                (0, fs_1.mkdirSync)(tempDir, { recursive: true });
            }
            // Write code to temporary file using secure file system
            this.secureFileSystem.writeFileSync(tempFile, code);
            // Execute code
            const [cmd, args] = language === 'typescript' ? ['npx', ['tsx', tempFile]] : ['node', [tempFile]];
            const result = await this.executeCommand(cmd, args, executionId);
            result.tempFilePath = tempFile;
            return result;
        }
        catch (error) {
            // Ensure cleanup on error
            await this.safeCleanup(tempFile);
            throw error;
        }
    }
    async executeCommand(command, args, executionId) {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)(command, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
                cwd: process.cwd(),
                env: { ...process.env, NODE_ENV: 'sandbox' }
            });
            this.activeExecutions.set(executionId, child);
            let stdout = "";
            let stderr = "";
            child.stdout?.on("data", (data) => {
                stdout += data.toString();
            });
            child.stderr?.on("data", (data) => {
                stderr += data.toString();
            });
            child.on("close", async (code) => {
                // Cleanup will be handled separately
                if (code === 0) {
                    resolve({
                        output: stdout || "Code executed successfully (no output)",
                        executionTime: 0
                    });
                }
                else {
                    resolve({
                        output: stdout || "",
                        error: stderr || `Process exited with code ${code}`,
                        executionTime: 0
                    });
                }
            });
            child.on("error", async (error) => {
                resolve({
                    output: "",
                    error: `Execution error: ${error.message}`,
                    executionTime: 0
                });
            });
            // Set timeout for execution
            const timeout = setTimeout(() => {
                child.kill('SIGTERM');
                resolve({
                    output: stdout || "",
                    error: `Execution timeout after ${this.config.executionTimeout}ms`,
                    executionTime: this.config.executionTimeout
                });
            }, this.config.executionTimeout);
            child.on("close", () => {
                clearTimeout(timeout);
            });
        });
    }
    async safeCleanup(filePath) {
        try {
            if ((0, fs_1.existsSync)(filePath)) {
                (0, fs_1.unlinkSync)(filePath);
                this.logger.debug('Temporary file cleaned up', { operation: 'cleanup', tempFile: filePath });
            }
        }
        catch (error) {
            this.logger.error('Failed to cleanup temporary file', {
                operation: 'cleanup',
                tempFile: filePath,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    async shutdown() {
        this.logger.info('Shutting down execution manager');
        // Kill all active executions
        for (const [executionId, child] of this.activeExecutions) {
            try {
                child.kill('SIGTERM');
                this.logger.debug('Killed active execution', { operation: 'shutdown', executionId });
            }
            catch (error) {
                this.logger.error('Error killing active execution', {
                    operation: 'shutdown',
                    executionId,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        this.activeExecutions.clear();
        this.executionCount = 0;
    }
    getActiveExecutionCount() {
        return this.executionCount;
    }
}
exports.ExecutionManager = ExecutionManager;
