const { analyzeCodeSafety } = require('./build/security/code-analyzer');

async function test() {
  const largeCode = 'const x = 1;\n'.repeat(10000);
  
  console.log('Testing large code...');
  const result = await analyzeCodeSafety(largeCode);
  console.log('Result:', result);
  console.log('Safe:', result.safe);
  console.log('Issues:', result.issues);
  console.log('Warnings:', result.warnings);
}

test().catch(console.error);
