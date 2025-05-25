#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🧪 改善された型チェック機能のテスト');
console.log('=====================================\n');

// MCPサーバーを起動
const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let testId = 0;

server.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('TypeScript & JavaScript Code Interpreter MCP Server running')) {
    console.log('✅ サーバーが起動しました\n');
    runTypeCheckTests();
  }
});

function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: ++testId,
    method: method,
    params: params
  };
  
  server.stdin.write(JSON.stringify(request) + '\n');
  return testId;
}

function runTypeCheckTests() {
  console.log('🔍 型チェックテストを開始...\n');
  
  // 初期化
  sendRequest('initialize', {
    protocolVersion: "2024-11-05",
    capabilities: { roots: {}, sampling: {} },
    clientInfo: { name: "type-test-client", version: "1.0.0" }
  });
  
  setTimeout(() => {
    console.log('📝 テスト1: 正常なTypeScriptコード');
    sendRequest('tools/call', {
      name: 'validate-typescript',
      arguments: {
        code: `interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Alice",
  age: 30
};

console.log(user.name);`
      }
    });
    
    setTimeout(() => {
      console.log('\n📝 テスト2: 型エラーのあるコード（型の不一致）');
      sendRequest('tools/call', {
        name: 'validate-typescript',
        arguments: {
          code: `const x: number = "string"; // 型エラー
const y: boolean = 123; // 型エラー
console.log(x, y);`
        }
      });
      
      setTimeout(() => {
        console.log('\n📝 テスト3: 型エラーのあるコード（プロパティ不足）');
        sendRequest('tools/call', {
          name: 'validate-typescript',
          arguments: {
            code: `interface Product {
  id: number;
  name: string;
  price: number;
}

const product: Product = {
  id: 1,
  name: "商品"
  // price プロパティが不足
};`
          }
        });
        
        setTimeout(() => {
          console.log('\n📝 テスト4: 構文エラーのあるコード');
          sendRequest('tools/call', {
            name: 'validate-typescript',
            arguments: {
              code: `const x = {
  name: "test"
  // カンマが不足
  value: 123
};`
            }
          });
          
          setTimeout(() => {
            console.log('\n🏁 全テスト送信完了。サーバーを終了します...');
            server.kill();
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
  }, 1000);
}

// サーバーからの応答を表示
server.stdout.on('data', (data) => {
  const output = data.toString().trim();
  if (output) {
    try {
      const response = JSON.parse(output);
      if (response.result && response.result.content && response.result.content[0]) {
        console.log('📋 結果:', response.result.content[0].text);
      }
    } catch (e) {
      console.log('📥 Raw response:', output);
    }
  }
});

server.on('close', (code) => {
  console.log(`\n✅ 型チェックテスト完了！サーバー終了コード: ${code}`);
});

server.on('error', (error) => {
  console.log('❌ サーバーエラー:', error.message);
});
