"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCodeSafety = analyzeCodeSafety;
exports.createSecurityAnalyzer = createSecurityAnalyzer;
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
// Fix for TypeScript + ESM
const babelTraverse = traverse_1.default.default || traverse_1.default;
const DANGEROUS_MODULES = [
    'child_process', 'cluster', 'worker_threads', 'dgram', 'dns', 'tls',
    'readline', 'repl', 'vm', 'inspector', 'v8', 'perf_hooks',
    'async_hooks', 'domain', 'module'
];
const RESTRICTED_MODULES = [
    'fs', 'net', 'http', 'https', 'os', 'crypto', 'stream', 'util',
    'zlib', 'buffer', 'path', 'querystring', 'string_decoder', 'timers',
    'tty', 'events', 'punycode', 'assert', 'url'
];
const DANGEROUS_GLOBALS = [
    'process', 'global', 'globalThis', '__dirname', '__filename',
    'Buffer', 'require', 'module', 'exports'
];
const EVAL_LIKE_FUNCTIONS = [
    'eval', 'Function', 'setTimeout', 'setInterval', 'setImmediate'
];
async function analyzeCodeSafety(code) {
    const result = {
        safe: true,
        issues: [],
        warnings: []
    };
    // Set timeout for analysis
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('Code complexity timeout'));
        }, 30000); // 30 second timeout for production use
    });
    try {
        // Race between analysis and timeout
        const analysisPromise = performAnalysis(code, result);
        await Promise.race([analysisPromise, timeoutPromise]);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('timeout')) {
            result.issues.push(`Code complexity timeout`);
        }
        else {
            result.issues.push(`Code parsing error: ${errorMessage}`);
        }
        result.safe = false;
    }
    return result;
}
async function performAnalysis(code, result) {
    // Parse the code
    const ast = (0, parser_1.parse)(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
    });
    // Traverse the AST
    babelTraverse(ast, {
        // Check for require() calls
        CallExpression(path) {
            const callee = path.node.callee;
            if (t.isIdentifier(callee) && callee.name === 'require') {
                const arg = path.node.arguments[0];
                if (t.isStringLiteral(arg)) {
                    const moduleName = arg.value;
                    if (DANGEROUS_MODULES.includes(moduleName)) {
                        result.issues.push(`Dangerous module import: ${moduleName}`);
                        result.safe = false;
                    }
                    else if (RESTRICTED_MODULES.includes(moduleName)) {
                        result.warnings.push(`Restricted module usage: ${moduleName}`);
                    }
                }
            }
            // Check for eval-like functions
            if (t.isIdentifier(callee) && EVAL_LIKE_FUNCTIONS.includes(callee.name)) {
                if (callee.name === 'eval') {
                    result.issues.push('eval() usage is not allowed');
                    result.safe = false;
                }
                else if (callee.name === 'Function') {
                    result.issues.push('Function constructor usage is not allowed');
                    result.safe = false;
                }
                else if (['setTimeout', 'setInterval', 'setImmediate'].includes(callee.name)) {
                    const arg = path.node.arguments[0];
                    if (t.isStringLiteral(arg)) {
                        result.issues.push(`${callee.name} with string argument is not allowed`);
                        result.safe = false;
                    }
                }
            }
        },
        // Check for import statements
        ImportDeclaration(path) {
            const moduleName = path.node.source.value;
            if (DANGEROUS_MODULES.includes(moduleName)) {
                result.issues.push(`Dangerous module import: ${moduleName}`);
                result.safe = false;
            }
            else if (RESTRICTED_MODULES.includes(moduleName)) {
                result.warnings.push(`Restricted module usage: ${moduleName}`);
            }
        },
        // Check for dynamic imports
        Import(path) {
            const parent = path.parent;
            if (t.isCallExpression(parent)) {
                const arg = parent.arguments[0];
                if (t.isStringLiteral(arg)) {
                    const moduleName = arg.value;
                    if (DANGEROUS_MODULES.includes(moduleName)) {
                        result.issues.push(`Dangerous dynamic import: ${moduleName}`);
                        result.safe = false;
                    }
                }
            }
        },
        // Check for member expressions (property access)
        MemberExpression(path) {
            const object = path.node.object;
            const property = path.node.property;
            if (t.isIdentifier(object) && DANGEROUS_GLOBALS.includes(object.name)) {
                if (t.isIdentifier(property)) {
                    result.warnings.push(`Potentially unsafe property access: ${object.name}.${property.name}`);
                }
                else if (t.isStringLiteral(property)) {
                    result.warnings.push(`Potentially unsafe property access: ${object.name}['${property.value}']`);
                }
                // Mark as unsafe for critical globals
                if (object.name === 'process' || object.name === 'global') {
                    result.safe = false;
                }
            }
        },
        // Check for new Function() constructor
        NewExpression(path) {
            const callee = path.node.callee;
            if (t.isIdentifier(callee) && callee.name === 'Function') {
                result.issues.push('Function constructor usage is not allowed');
                result.safe = false;
            }
        },
        // Check for with statements
        WithStatement() {
            result.issues.push('with statement is not allowed');
            result.safe = false;
        },
        // Check for debugger statements
        DebuggerStatement() {
            result.warnings.push('debugger statement found');
        },
        // Check for assignment to dangerous globals
        AssignmentExpression(path) {
            const left = path.node.left;
            if (t.isMemberExpression(left)) {
                const object = left.object;
                if (t.isIdentifier(object) && DANGEROUS_GLOBALS.includes(object.name)) {
                    result.warnings.push(`Assignment to potentially dangerous global: ${object.name}`);
                }
            }
        }
    });
    // Additional checks for obfuscated code
    if (containsObfuscatedCode(code)) {
        result.issues.push('Obfuscated code pattern detected');
        result.safe = false;
    }
    // Check for base64 patterns
    if (containsBase64Payload(code)) {
        result.issues.push('Base64 encoded payload detected');
        result.safe = false;
    }
    // Check for prototype pollution
    if (containsPrototypePollution(code)) {
        result.issues.push('Prototype pollution attempt detected');
        result.safe = false;
    }
    // Check for path traversal
    if (containsPathTraversal(code)) {
        result.issues.push('Path traversal attempt detected');
        result.safe = false;
    }
    // Check for network access
    if (containsNetworkAccess(code)) {
        result.issues.push('Network access is not allowed');
        result.safe = false;
    }
    // Check for fetch API
    if (containsFetchAPI(code)) {
        result.issues.push('Network fetch is not allowed');
        result.safe = false;
    }
    // Check for excessive complexity
    if (isExcessivelyComplex(code)) {
        result.warnings.push('Code complexity is very high');
        // Note: We don't set safe = false for complexity warnings
    }
}
function containsObfuscatedCode(code) {
    // Simple heuristics for obfuscated code
    const obfuscationPatterns = [
        /\\x[0-9a-fA-F]{2}/g, // Hex escapes
        /\\u[0-9a-fA-F]{4}/g, // Unicode escapes
        /\\[0-7]{1,3}/g, // Octal escapes
        /['"][^'"]*\\[xuU][^'"]*['"]/g, // String with escapes
        /[_$][a-zA-Z0-9_$]{20,}/g, // Very long identifiers
        /[^a-zA-Z0-9\s]{20,}/g, // Long sequences of special characters
        /\x65\x76\x61\x6c/g, // Hex encoded 'eval'
        /\u0065\u0076\u0061\u006c/g, // Unicode encoded 'eval'
        /String\s*\.\s*fromCharCode/g, // String.fromCharCode obfuscation
        /\[\s*\d+\s*\]\s*\[\s*\d+\s*\]/g // Array index obfuscation
    ];
    return obfuscationPatterns.some(pattern => pattern.test(code));
}
function containsBase64Payload(code) {
    // Look for base64 patterns
    const base64Pattern = /[A-Za-z0-9+/]{20,}={0,2}/g;
    return base64Pattern.test(code);
}
function containsPrototypePollution(code) {
    // Look for prototype pollution patterns
    const pollutionPatterns = [
        /prototype\s*\[\s*['"]constructor['"]\s*\]/g,
        /prototype\s*\[\s*['"]__proto__['"]\s*\]/g,
        /\.__proto__\s*=/g,
        /\["__proto__"\]/g,
        /\['__proto__'\]/g,
        /prototype\s*\.\s*constructor/g,
        /Object\s*\.\s*prototype/g
    ];
    return pollutionPatterns.some(pattern => pattern.test(code));
}
function containsPathTraversal(code) {
    // Look for path traversal patterns
    const traversalPatterns = [
        /\.\.\//g,
        /\.\.\\\\?/g,
        /\.\.\\/g,
        /\.\.%2F/g,
        /\.\.%5C/g
    ];
    return traversalPatterns.some(pattern => pattern.test(code));
}
function containsNetworkAccess(code) {
    // Look for network access patterns
    const networkPatterns = [
        /http\s*\.\s*createServer/g,
        /https\s*\.\s*createServer/g,
        /net\s*\.\s*createServer/g,
        /require\s*\(\s*['"]https?['"]\s*\)/g,
        /require\s*\(\s*['"]net['"]\s*\)/g,
        /fs\s*\.\s*readFile/g,
        /fs\s*\.\s*writeFile/g,
        /fs\s*\.\s*unlink/g,
        /fs\s*\.\s*mkdir/g,
        /fs\s*\.\s*rmdir/g,
        /require\s*\(\s*['"]fs['"]\s*\)/g,
        /import.*fs.*from/g
    ];
    return networkPatterns.some(pattern => pattern.test(code));
}
function containsFetchAPI(code) {
    // Look for fetch API usage
    const fetchPatterns = [
        /\bfetch\s*\(/g,
        /\bXMLHttpRequest\s*\(/g,
        /\bWebSocket\s*\(/g
    ];
    return fetchPatterns.some(pattern => pattern.test(code));
}
function isExcessivelyComplex(code) {
    // Simple complexity check
    const lines = code.split('\n');
    const linesOfCode = lines.filter(line => line.trim().length > 0).length;
    const cyclomaticComplexity = (code.match(/\b(if|else|for|while|switch|case|catch|&&|\|\|)\b/g) || []).length;
    return linesOfCode > 1000 || cyclomaticComplexity > 50;
}
function createSecurityAnalyzer() {
    return {
        analyzeCode: analyzeCodeSafety,
        isDangerous: (code) => {
            return DANGEROUS_MODULES.some(module => code.includes(`require('${module}')`) ||
                code.includes(`require("${module}")`) ||
                code.includes(`import`) && code.includes(module));
        },
        hasEval: (code) => {
            return /\beval\s*\(/.test(code) || /new\s+Function\s*\(/.test(code);
        }
    };
}
