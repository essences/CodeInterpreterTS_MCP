#!/usr/bin/env node

const { spawn } = require('child_process');

// MCPサーバーをテストするためのヘルパー関数
async function testMCPServer() {
  console.log('🚀 TypeScript Code Interpreter MCPサーバーのテストを開始...\n');

  // サーバープロセスを起動
  const server = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let responseBuffer = '';
  
  // サーバーからの応答を収集
  server.stdout.on('data', (data) => {
    responseBuffer += data.toString();
  });

  server.stderr.on('data', (data) => {
    console.log('Server stderr:', data.toString());
  });

  // テスト1: 初期化
  console.log('📝 テスト1: サーバー初期化');
  const initMessage = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  };

  server.stdin.write(JSON.stringify(initMessage) + '\n');

  // 少し待ってから次のテスト
  await new Promise(resolve => setTimeout(resolve, 1000));

  // テスト2: ツール一覧の取得
  console.log('📝 テスト2: ツール一覧取得');
  const listToolsMessage = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  };

  server.stdin.write(JSON.stringify(listToolsMessage) + '\n');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // テスト3: TypeScriptコード実行
  console.log('📝 テスト3: TypeScriptコード実行');
  const executeMessage = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "execute-typescript",
      arguments: {
        code: `console.log("Hello from TypeScript MCP Server!");
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`
      }
    }
  };

  server.stdin.write(JSON.stringify(executeMessage) + '\n');

  await new Promise(resolve => setTimeout(resolve, 2000));

  // テスト4: 型チェック（正常なコード）
  console.log('📝 テスト4: 型チェック（正常なコード）');
  const validateGoodMessage = {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "validate-typescript",
      arguments: {
        code: `interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Alice",
  age: 30
};`
      }
    }
  };

  server.stdin.write(JSON.stringify(validateGoodMessage) + '\n');

  await new Promise(resolve => setTimeout(resolve, 1500));

  // テスト5: 型チェック（エラーのあるコード）
  console.log('📝 テスト5: 型チェック（型エラーのあるコード）');
  const validateBadMessage = {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "validate-typescript",
      arguments: {
        code: `interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Bob",
  // age プロパティが不足 - これは型エラー
};`
      }
    }
  };

  server.stdin.write(JSON.stringify(validateBadMessage) + '\n');

  await new Promise(resolve => setTimeout(resolve, 1500));

  // サーバーを終了
  server.kill();

  // 結果の表示
  console.log('\n📊 テスト結果:');
  console.log('=====================================');
  
  if (responseBuffer) {
    const responses = responseBuffer.split('\n').filter(line => line.trim());
    responses.forEach((response, index) => {
      try {
        const parsed = JSON.parse(response);
        console.log(`Response ${index + 1}:`, JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(`Response ${index + 1} (raw):`, response);
      }
    });
  } else {
    console.log('❌ サーバーからの応答がありませんでした');
  }

  console.log('\n✅ テスト完了');
}

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('❌ テスト中にエラーが発生:', error.message);
  process.exit(1);
});

// テスト実行
testMCPServer().catch(console.error);
