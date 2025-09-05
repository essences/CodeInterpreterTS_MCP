const { resolve, join } = require('path');

// Test the exact scenario from the failing test
const testWorkspace = resolve(__dirname, 'tests/fixtures/test-workspace');
const parentPath = join(testWorkspace, 'allowed', '../forbidden/secret.txt');

console.log('testWorkspace:', testWorkspace);
console.log('parentPath:', parentPath);
console.log('contains ..:', parentPath.includes('..'));
console.log('resolved:', resolve(parentPath));

// Test PathValidator
const { PathValidator } = require('./build/security/path-validator');

const config = {
  enabled: true,
  allowedDirectories: [join(testWorkspace, 'allowed')],
  forbiddenDirectories: [join(testWorkspace, 'forbidden')],
  restrictToHome: false,
  allowTempDir: false,
  blockParentAccess: true,
  maxDepth: 10,
  allowedExtensions: ['.txt', '.json']
};

const validator = new PathValidator(config);
const result = validator.validatePath(parentPath);

console.log('Result:', result);
console.log('parentPath contains ..:', parentPath.includes('..'));
console.log('is in forbidden dir:', result.normalizedPath.includes('forbidden'));
