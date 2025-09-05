// Unsafe TypeScript code sample
const fs = require('fs');

// Attempting to access forbidden directory
const secretData = fs.readFileSync('/etc/passwd', 'utf8');
console.log(secretData);

// Attempting to use dangerous APIs
const processModule = require('process');
console.log(processModule.env);

// Attempting to access parent directory
const parentData = fs.readFileSync('../../../etc/hosts', 'utf8');
console.log(parentData);
