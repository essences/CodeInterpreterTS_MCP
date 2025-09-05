"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureFileSystem = exports.SecureFileSystemError = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_validator_1 = require("./path-validator");
class SecureFileSystemError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SecureFileSystemError';
    }
}
exports.SecureFileSystemError = SecureFileSystemError;
class SecureFileSystem {
    pathValidator;
    constructor(config) {
        this.pathValidator = new path_validator_1.PathValidator(config);
    }
    readFileSync(path) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
        }
        try {
            return (0, fs_1.readFileSync)(validation.normalizedPath, 'utf8');
        }
        catch (error) {
            throw new SecureFileSystemError(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async readFile(path) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
        }
        try {
            return await (0, promises_1.readFile)(validation.normalizedPath, 'utf8');
        }
        catch (error) {
            throw new SecureFileSystemError(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    writeFileSync(path, content) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
        }
        try {
            (0, fs_1.writeFileSync)(validation.normalizedPath, content, 'utf8');
        }
        catch (error) {
            throw new SecureFileSystemError(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async writeFile(path, content) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
        }
        try {
            await (0, promises_1.writeFile)(validation.normalizedPath, content, 'utf8');
        }
        catch (error) {
            throw new SecureFileSystemError(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    existsSync(path) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            return false; // Don't reveal existence of forbidden paths
        }
        try {
            return (0, fs_1.existsSync)(validation.normalizedPath);
        }
        catch {
            return false;
        }
    }
    mkdirSync(path, options) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
        }
        try {
            (0, fs_1.mkdirSync)(validation.normalizedPath, options);
        }
        catch (error) {
            throw new SecureFileSystemError(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async mkdir(path, options) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
        }
        try {
            await (0, promises_1.mkdir)(validation.normalizedPath, options);
        }
        catch (error) {
            throw new SecureFileSystemError(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    rmSync(path, options) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
        }
        try {
            (0, fs_1.rmSync)(validation.normalizedPath, options);
        }
        catch (error) {
            throw new SecureFileSystemError(`Failed to remove: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async rm(path, options) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
        }
        try {
            await (0, promises_1.rm)(validation.normalizedPath, options);
        }
        catch (error) {
            throw new SecureFileSystemError(`Failed to remove: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    lstatSync(path) {
        const validation = this.pathValidator.validatePath(path);
        if (!validation.allowed) {
            throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
        }
        try {
            return (0, fs_1.lstatSync)(validation.normalizedPath);
        }
        catch (error) {
            throw new SecureFileSystemError(`Failed to stat file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    validatePath(path) {
        return this.pathValidator.validatePath(path);
    }
    getConfig() {
        return this.pathValidator.getConfig();
    }
    updateConfig(config) {
        this.pathValidator.updateConfig(config);
    }
}
exports.SecureFileSystem = SecureFileSystem;
