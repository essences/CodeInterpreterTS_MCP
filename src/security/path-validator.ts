import { resolve, extname } from 'path';
import { existsSync, lstatSync } from 'fs';
import { homedir, tmpdir } from 'os';

export interface SecurityConfig {
  enabled: boolean;
  allowedDirectories: string[];
  forbiddenDirectories: string[];
  restrictToHome: boolean;
  allowTempDir: boolean;
  blockParentAccess: boolean;
  maxDepth: number;
  allowedExtensions: string[];
}

export interface ValidationResult {
  allowed: boolean;
  normalizedPath: string;
  reason?: string;
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class PathValidator {
  private config: SecurityConfig;
  private homeDir: string;
  private tempDir: string;

  constructor(config: SecurityConfig) {
    this.validateConfig(config);
    this.config = config;
    this.homeDir = homedir();
    this.tempDir = tmpdir();
  }

  public validatePath(inputPath: string): ValidationResult {
    if (!this.config.enabled) {
      return {
        allowed: true,
        normalizedPath: resolve(inputPath)
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
    const normalizedPath = resolve(inputPath);

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

  private isInForbiddenDirectory(path: string): boolean {
    return this.config.forbiddenDirectories.some(forbidden => {
      const forbiddenPath = resolve(forbidden);
      return path.startsWith(forbiddenPath);
    });
  }

  private isInAllowedDirectory(path: string): boolean {
    // Always allow temp directory if configured
    if (this.config.allowTempDir && path.startsWith(this.tempDir)) {
      return true;
    }

    return this.config.allowedDirectories.some(allowed => {
      const allowedPath = resolve(allowed);
      return path.startsWith(allowedPath);
    });
  }

  private hasParentAccess(path: string): boolean {
    // Check for .. in the path
    return path.includes('..');
  }

  private exceedsMaxDepth(path: string): boolean {
    // Check depth relative to allowed directories
    for (const allowedDir of this.config.allowedDirectories) {
      const allowedPath = resolve(allowedDir);
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

  private hasAllowedExtension(path: string): boolean {
    if (this.config.allowedExtensions.length === 0) {
      return true; // No restrictions
    }

    const extension = extname(path).toLowerCase();
    return this.config.allowedExtensions.includes(extension);
  }

  private isSymlink(path: string): boolean {
    try {
      if (existsSync(path)) {
        const stats = lstatSync(path);
        return stats.isSymbolicLink();
      }
      return false;
    } catch {
      return false;
    }
  }

  private isInHomeDirectory(path: string): boolean {
    return path.startsWith(this.homeDir);
  }

  public validateConfig(config: SecurityConfig): void {
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
      const resolvedDir = resolve(dir);
      if (!existsSync(resolvedDir)) {
        throw new SecurityError(`Allowed directory does not exist: ${resolvedDir}`);
      }
    });
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: SecurityConfig): void {
    this.validateConfig(newConfig);
    this.config = newConfig;
  }
}
