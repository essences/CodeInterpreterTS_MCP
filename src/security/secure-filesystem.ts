import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, lstatSync } from 'fs';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { PathValidator } from './path-validator';
import type { SecurityConfig } from './path-validator';

export class SecureFileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecureFileSystemError';
  }
}

export class SecureFileSystem {
  private pathValidator: PathValidator;

  constructor(config: SecurityConfig) {
    this.pathValidator = new PathValidator(config);
  }

  public readFileSync(path: string): string {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
    }

    try {
      return readFileSync(validation.normalizedPath, 'utf8');
    } catch (error) {
      throw new SecureFileSystemError(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async readFile(path: string): Promise<string> {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
    }

    try {
      return await readFile(validation.normalizedPath, 'utf8');
    } catch (error) {
      throw new SecureFileSystemError(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public writeFileSync(path: string, content: string): void {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
    }

    try {
      writeFileSync(validation.normalizedPath, content, 'utf8');
    } catch (error) {
      throw new SecureFileSystemError(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async writeFile(path: string, content: string): Promise<void> {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
    }

    try {
      await writeFile(validation.normalizedPath, content, 'utf8');
    } catch (error) {
      throw new SecureFileSystemError(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public existsSync(path: string): boolean {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      return false; // Don't reveal existence of forbidden paths
    }

    try {
      return existsSync(validation.normalizedPath);
    } catch {
      return false;
    }
  }

  public mkdirSync(path: string, options?: { recursive?: boolean }): void {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
    }

    try {
      mkdirSync(validation.normalizedPath, options);
    } catch (error) {
      throw new SecureFileSystemError(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
    }

    try {
      await mkdir(validation.normalizedPath, options);
    } catch (error) {
      throw new SecureFileSystemError(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
    }

    try {
      rmSync(validation.normalizedPath, options);
    } catch (error) {
      throw new SecureFileSystemError(`Failed to remove: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void> {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
    }

    try {
      await rm(validation.normalizedPath, options);
    } catch (error) {
      throw new SecureFileSystemError(`Failed to remove: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public lstatSync(path: string): ReturnType<typeof lstatSync> {
    const validation = this.pathValidator.validatePath(path);
    if (!validation.allowed) {
      throw new SecureFileSystemError(`Access denied: ${validation.reason}`);
    }

    try {
      return lstatSync(validation.normalizedPath);
    } catch (error) {
      throw new SecureFileSystemError(`Failed to stat file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public validatePath(path: string) {
    return this.pathValidator.validatePath(path);
  }

  public getConfig() {
    return this.pathValidator.getConfig();
  }

  public updateConfig(config: SecurityConfig) {
    this.pathValidator.updateConfig(config);
  }
}
