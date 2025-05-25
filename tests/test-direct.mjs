#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🔬 Direct MCP Server Test - TypeScript & JavaScript Features');
console.log('===========================================================\n');

// MCPサーバーを起動
const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let testCount = 0;
let responses = [];

// 応答を収集
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📥 Server response:', output.trim());
  responses.push(output);
});

server.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('TypeScript & JavaScript Code Interpreter MCP Server running')) {
    console.log('✅ Server started successfully\n');
    startTests();
  }
});

function sendRequest(method, params = {}, id = null) {
  const request = {
    jsonrpc: "2.0",
    id: id || ++testCount,
    method: method,
    params: params
  };
  
  console.log(`📤 Sending request ${testCount}:`, method);
  server.stdin.write(JSON.stringify(request) + '\n');
}

function startTests() {
  console.log('🚀 Starting MCP tests...\n');
  
  // 1. Initialize
  sendRequest('initialize', {
    protocolVersion: "2024-11-05",
    capabilities: { roots: {}, sampling: {} },
    clientInfo: { name: "test-client", version: "1.0.0" }
  });
  
  setTimeout(() => {
    // 2. List tools
    sendRequest('tools/list');
    
    setTimeout(() => {
      // 3. Test TypeScript execution
      sendRequest('tools/call', {
        name: 'execute-typescript',
        arguments: {
          code: 'console.log("Hello TypeScript!"); const x: number = 42; console.log(`Number: ${x}`);'
        }
      });
      
      setTimeout(() => {
        // 4. Test JavaScript execution
        sendRequest('tools/call', {
          name: 'execute-javascript',
          arguments: {
            code: 'console.log("Hello JavaScript!"); const arr = [1,2,3]; console.log("Array:", arr);'
          }
        });
        
        setTimeout(() => {
          // 5. Test TypeScript validation (valid)
          sendRequest('tools/call', {
            name: 'validate-typescript',
            arguments: {
              code: 'interface User { name: string; } const user: User = { name: "Alice" };'
            }
          });
          
          setTimeout(() => {
            // 6. Test TypeScript validation (invalid)
            sendRequest('tools/call', {
              name: 'validate-typescript',
              arguments: {
                code: 'const x: number = "string"; // Type error'
              }
            });
            
            setTimeout(() => {
              console.log('\n🏁 All tests sent, terminating server...');
              server.kill();
              
              setTimeout(() => {
                console.log('\n📊 Test Summary:');
                console.log(`Total responses received: ${responses.length}`);
                console.log('✅ MCP Server Direct Test Complete!');
              }, 1000);
            }, 2000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

server.on('error', (error) => {
  console.log('❌ Server error:', error.message);
});

server.on('close', (code) => {
  console.log(`\n🔚 Server exited with code ${code}`);
});
