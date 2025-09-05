const { PathValidator } = require('./build/security/path-validator.js');
const { resolve, join } = require('path');

// 簡単なテスト用のスクリプト
const testWorkspace = resolve(__dirname, 'tests/fixtures/test-workspace');
const config = {
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

console.log('Test workspace:', testWorkspace);
console.log('Allowed directories:', config.allowedDirectories);

const validator = new PathValidator(config);

const testPath = join(testWorkspace, 'allowed', 'subdir', 'nested.json');
console.log('Test path:', testPath);
console.log('Test path normalized:', resolve(testPath));

const result = validator.validatePath(testPath);
console.log('Validation result:', result);
