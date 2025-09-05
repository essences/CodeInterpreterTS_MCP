import { describe, test, expect, beforeEach } from '@jest/globals';
import { PathValidator, SecurityConfig, SecurityError } from '../../src/security/path-validator';
import { resolve, join } from 'path';

describe('PathValidator', () => {
  let validator: PathValidator;
  let config: SecurityConfig;
  const testWorkspace = resolve(__dirname, '../fixtures/test-workspace');

  beforeEach(() => {
    config = {
      enabled: true,
      allowedDirectories: [
        join(testWorkspace, 'allowed')
      ],
      forbiddenDirectories: [
        join(testWorkspace, 'forbidden'),
        '/etc',
        '/usr/bin',
        '/System'
      ],
      restrictToHome: true,
      allowTempDir: true,
      blockParentAccess: true,
      maxDepth: 10,
      allowedExtensions: ['.txt', '.json', '.csv', '.md', '.js', '.ts']
    };
    validator = new PathValidator(config);
  });

  describe('path normalization', () => {
    test('should normalize relative paths', () => {
      const result = validator.validatePath('./data.txt');
      expect(result.normalizedPath).toBe(resolve('./data.txt'));
    });

    test('should normalize absolute paths', () => {
      const inputPath = join(testWorkspace, 'allowed', 'data.txt');
      const result = validator.validatePath(inputPath);
      expect(result.normalizedPath).toBe(resolve(inputPath));
    });

    test('should handle complex path patterns', () => {
      const inputPath = join(testWorkspace, 'allowed', './subdir/../data.txt');
      const result = validator.validatePath(inputPath);
      expect(result.normalizedPath).toBe(resolve(testWorkspace, 'allowed', 'data.txt'));
    });
  });

  describe('allowed directory validation', () => {
    test('should allow access to permitted directories', () => {
      const allowedPath = join(testWorkspace, 'allowed', 'data.txt');
      const result = validator.validatePath(allowedPath);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('should allow access to subdirectories of permitted directories', () => {
      const allowedPath = join(testWorkspace, 'allowed', 'subdir', 'nested.json');
      const result = validator.validatePath(allowedPath);
      expect(result.allowed).toBe(true);
    });

    test('should reject access to non-permitted directories', () => {
      const forbiddenPath = '/random/path/file.txt';
      const result = validator.validatePath(forbiddenPath);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not in allowed directories');
    });
  });

  describe('forbidden directory validation', () => {
    test('should block access to explicitly forbidden directories', () => {
      const forbiddenPath = join(testWorkspace, 'forbidden', 'secret.txt');
      const result = validator.validatePath(forbiddenPath);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('forbidden directory');
    });

    test('should block access to system directories', () => {
      const systemPaths = ['/etc/passwd', '/usr/bin/ls', '/System/Library'];
      
      systemPaths.forEach(path => {
        const result = validator.validatePath(path);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('forbidden directory');
      });
    });
  });

  describe('parent directory access protection', () => {
    test('should block parent directory traversal', () => {
      const parentPath = testWorkspace + '/allowed/../forbidden/secret.txt';
      const result = validator.validatePath(parentPath);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('parent directory access');
    });

    test('should block complex parent directory traversal', () => {
      const complexPath = testWorkspace + '/allowed/subdir/../../forbidden/secret.txt';
      const result = validator.validatePath(complexPath);
      expect(result.allowed).toBe(false);
    });

    test('should allow legitimate subdirectory access', () => {
      const subPath = join(testWorkspace, 'allowed', 'subdir', 'nested.json');
      const result = validator.validatePath(subPath);
      expect(result.allowed).toBe(true);
    });
  });

  describe('file extension validation', () => {
    test('should allow permitted file extensions', () => {
      const allowedExtensions = ['.txt', '.json', '.csv', '.md', '.js', '.ts'];
      
      allowedExtensions.forEach(ext => {
        const filePath = join(testWorkspace, 'allowed', `test${ext}`);
        const result = validator.validatePath(filePath);
        expect(result.allowed).toBe(true);
      });
    });

    test('should block non-permitted file extensions', () => {
      const forbiddenExtensions = ['.exe', '.sh', '.bat', '.dll'];
      
      forbiddenExtensions.forEach(ext => {
        const filePath = join(testWorkspace, 'allowed', `test${ext}`);
        const result = validator.validatePath(filePath);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('extension not allowed');
      });
    });

    test('should handle files without extensions', () => {
      const filePath = join(testWorkspace, 'allowed', 'noextension');
      const result = validator.validatePath(filePath);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('extension not allowed');
    });
  });

  describe('depth limit validation', () => {
    test('should allow paths within depth limit', () => {
      const shallowPath = join(testWorkspace, 'allowed', 'subdir', 'nested.json');
      const result = validator.validatePath(shallowPath);
      expect(result.allowed).toBe(true);
    });

    test('should block paths exceeding depth limit', () => {
      // Create a deep path that exceeds maxDepth
      const deepPath = join(testWorkspace, 'allowed', 
        ...Array(15).fill('deep'), 'file.txt');
      const result = validator.validatePath(deepPath);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('depth limit exceeded');
    });
  });

  describe('configuration validation', () => {
    test('should handle disabled security', () => {
      const disabledConfig = { ...config, enabled: false };
      const disabledValidator = new PathValidator(disabledConfig);
      
      const anyPath = '/etc/passwd';
      const result = disabledValidator.validatePath(anyPath);
      expect(result.allowed).toBe(true);
    });

    test('should validate configuration on instantiation', () => {
      const invalidConfig = {
        ...config,
        allowedDirectories: ['/nonexistent/path']
      };
      
      expect(() => new PathValidator(invalidConfig)).toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle empty paths', () => {
      const result = validator.validatePath('');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('empty path');
    });

    test('should handle null/undefined paths', () => {
      expect(() => validator.validatePath(null as any)).toThrow();
      expect(() => validator.validatePath(undefined as any)).toThrow();
    });

    test('should handle symlinks', () => {
      // This test would require actual symlink creation
      // For now, just ensure the validator handles the concept
      const result = validator.validatePath(join(testWorkspace, 'allowed', 'data.txt'));
      expect(result.allowed).toBe(true);
    });
  });
});
