"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathValidator = exports.SecurityError = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const os_1 = require("os");
class SecurityError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SecurityError';
    }
}
exports.SecurityError = SecurityError;
class PathValidator {
    config;
    homeDir;
    tempDir;
    constructor(config) {
        this.validateConfig(config);
        this.config = config;
        this.homeDir = (0, os_1.homedir)();
        this.tempDir = (0, os_1.tmpdir)();
    }
    validatePath(inputPath) {
        if (!this.config.enabled) {
            return {
                allowed: true,
                normalizedPath: (0, path_1.resolve)(inputPath)
            };
        }
        // Check for null/undefined
        if (inputPath === null || inputPath === undefined) {
            throw new SecurityError('Path cannot be null or undefined');
        }
        // Check for empty path
        if (!inputPath || inputPath.trim() === '') {
            return {
                allowed: false,
                normalizedPath: '',
                reason: 'empty path'
            };
        }
        // Normalize the path
        const normalizedPath = (0, path_1.resolve)(inputPath);
        // Check for parent directory access before other checks
        if (this.config.blockParentAccess && this.hasParentAccess(inputPath)) {
            return {
                allowed: false,
                normalizedPath,
                reason: 'parent directory access'
            };
        }
        // Check for forbidden directories
        if (this.isInForbiddenDirectory(normalizedPath)) {
            return {
                allowed: false,
                normalizedPath,
                reason: 'Path is in forbidden directory'
            };
        }
        // Check if path is in allowed directories
        if (!this.isInAllowedDirectory(normalizedPath)) {
            return {
                allowed: false,
                normalizedPath,
                reason: 'Path is not in allowed directories'
            };
        }
        // Check depth restriction
        if (this.exceedsMaxDepth(normalizedPath)) {
            return {
                allowed: false,
                normalizedPath,
                reason: 'depth limit exceeded'
            };
        }
        // Check for file extension
        if (!this.hasAllowedExtension(normalizedPath)) {
            return {
                allowed: false,
                normalizedPath,
                reason: 'extension not allowed'
            };
        }
        // Check for symlinks
        if (this.isSymlink(normalizedPath)) {
            return {
                allowed: false,
                normalizedPath,
                reason: 'Symlinks are not allowed'
            };
        }
        // Check home directory restriction
        if (this.config.restrictToHome && !this.isInHomeDirectory(normalizedPath)) {
            return {
                allowed: false,
                normalizedPath,
                reason: 'Path is outside home directory'
            };
        }
        return {
            allowed: true,
            normalizedPath
        };
    }
    isInForbiddenDirectory(path) {
        return this.config.forbiddenDirectories.some(forbidden => {
            const forbiddenPath = (0, path_1.resolve)(forbidden);
            return path.startsWith(forbiddenPath);
        });
    }
    isInAllowedDirectory(path) {
        // Always allow temp directory if configured
        if (this.config.allowTempDir && path.startsWith(this.tempDir)) {
            return true;
        }
        return this.config.allowedDirectories.some(allowed => {
            const allowedPath = (0, path_1.resolve)(allowed);
            return path.startsWith(allowedPath);
        });
    }
    hasParentAccess(path) {
        // Check for .. in the path
        return path.includes('..');
    }
    exceedsMaxDepth(path) {
        // Check depth relative to allowed directories
        for (const allowedDir of this.config.allowedDirectories) {
            const allowedPath = (0, path_1.resolve)(allowedDir);
            if (path.startsWith(allowedPath)) {
                const relativePath = path.substring(allowedPath.length);
                const depth = relativePath.split('/').filter(part => part.length > 0).length;
                return depth > this.config.maxDepth;
            }
        }
        // If not in any allowed directory, use absolute path depth
        const depth = path.split('/').filter(part => part.length > 0).length;
        return depth > this.config.maxDepth;
    }
    hasAllowedExtension(path) {
        if (this.config.allowedExtensions.length === 0) {
            return true; // No restrictions
        }
        const extension = (0, path_1.extname)(path).toLowerCase();
        return this.config.allowedExtensions.includes(extension);
    }
    isSymlink(path) {
        try {
            if ((0, fs_1.existsSync)(path)) {
                const stats = (0, fs_1.lstatSync)(path);
                return stats.isSymbolicLink();
            }
            return false;
        }
        catch {
            return false;
        }
    }
    isInHomeDirectory(path) {
        return path.startsWith(this.homeDir);
    }
    validateConfig(config) {
        if (!config.enabled) {
            return;
        }
        if (!config.allowedDirectories || config.allowedDirectories.length === 0) {
            throw new SecurityError('At least one allowed directory must be specified');
        }
        if (config.maxDepth < 1) {
            throw new SecurityError('Maximum depth must be at least 1');
        }
        // Ensure all directories exist
        config.allowedDirectories.forEach(dir => {
            const resolvedDir = (0, path_1.resolve)(dir);
            if (!(0, fs_1.existsSync)(resolvedDir)) {
                throw new SecurityError(`Allowed directory does not exist: ${resolvedDir}`);
            }
        });
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(newConfig) {
        this.validateConfig(newConfig);
        this.config = newConfig;
    }
}
exports.PathValidator = PathValidator;
