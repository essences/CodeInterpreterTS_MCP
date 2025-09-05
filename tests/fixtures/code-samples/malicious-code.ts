// Malicious TypeScript code sample
const childProcess = require('child_process');

// Attempting to execute system commands
try {
  const output = childProcess.execSync('cat /etc/passwd').toString();
  console.log('System file content:', output);
} catch (error) {
  console.log('Command failed:', error.message);
}

// Attempting to use eval
const maliciousCode = 'require("fs").readFileSync("/etc/passwd", "utf8")';
try {
  const result = eval(maliciousCode);
  console.log('Eval result:', result);
} catch (error) {
  console.log('Eval failed:', error.message);
}

// Attempting to access global objects
try {
  const global = require('global');
  console.log('Global access:', global);
} catch (error) {
  console.log('Global access failed:', error.message);
}
