#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🔌 MCP プロトコル通信テスト開始\n');

const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;

function sendMCPMessage(method, params = {}) {
  const message = {
    jsonrpc: "2.0",
    id: messageId++,
    method,
    params
  };
  
  const messageString = JSON.stringify(message) + '\n';
  console.log('📤 送信:', JSON.stringify(message, null, 2));
  server.stdin.write(messageString);
}

function sendNotification(method, params = {}) {
  const message = {
    jsonrpc: "2.0",
    method,
    params
  };
  
  const messageString = JSON.stringify(message) + '\n';
  console.log('📤 通知:', JSON.stringify(message, null, 2));
  server.stdin.write(messageString);
}

let responseBuffer = '';

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  
  // 改行で分割してメッセージを処理
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop() || ''; // 最後の不完全な行を保持
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('📥 受信:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📥 受信 (非JSON):', line);
      }
    }
  });
});

server.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

server.on('error', (error) => {
  console.log('❌ サーバーエラー:', error.message);
});

// テストシーケンス
setTimeout(() => {
  console.log('\n1️⃣ 初期化要求を送信');
  sendMCPMessage('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {
      roots: {},
      sampling: {}
    },
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  });
}, 1000);

setTimeout(() => {
  console.log('\n2️⃣ ツール一覧要求を送信');
  sendMCPMessage('tools/list');
}, 2000);

setTimeout(() => {
  console.log('\n3️⃣ TypeScript実行テストを送信');
  sendMCPMessage('tools/call', {
    name: 'execute-typescript',
    arguments: {
      code: 'console.log("Hello from TypeScript MCP Server!");\nconst x = 42;\nconsole.log(`The answer is ${x}`);'
    }
  });
}, 3000);

setTimeout(() => {
  console.log('\n4️⃣ TypeScript型チェックテストを送信');
  sendMCPMessage('tools/call', {
    name: 'validate-typescript',
    arguments: {
      code: 'interface User { name: string; age: number; }\nconst user: User = { name: "Alice", age: 30 };\nconsole.log(user.name);'
    }
  });
}, 4000);

setTimeout(() => {
  console.log('\n5️⃣ 型エラーテストを送信');
  sendMCPMessage('tools/call', {
    name: 'validate-typescript',
    arguments: {
      code: 'const x: number = "string"; // 型エラー\nconsole.log(x);'
    }
  });
}, 5000);

setTimeout(() => {
  console.log('\n🏁 テスト完了 - サーバーを終了します');
  server.kill();
  
  console.log('\n=====================================');
  console.log('✅ MCP プロトコル通信テスト完了！');
  console.log('');
  console.log('このサーバーは以下のMCPツールを提供します：');
  console.log('• execute-typescript: TypeScriptコードを実行');
  console.log('• validate-typescript: TypeScriptコードの型チェック');
  console.log('');
  console.log('Claude for Desktopでの設定方法は README.md をご確認ください。');
}, 6000);
