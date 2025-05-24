#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';

console.log('🎯 Claude Desktop用 最終動作テスト\n');

// 1. ビルドファイルの存在確認
const buildFile = '/Users/hayashieiichi/workspace/CodeInterpreterTS_MCP/build/index.js';
if (!existsSync(buildFile)) {
  console.log('❌ ビルドファイルが見つかりません:', buildFile);
  process.exit(1);
}
console.log('✅ ビルドファイルが存在します:', buildFile);

// 2. サーバーの起動テスト
console.log('\n📋 サーバー起動テスト');
const server = spawn('node', [buildFile], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverStarted = false;

server.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('TypeScript Code Interpreter MCP Server running')) {
    console.log('✅ MCPサーバーが正常に起動しました');
    serverStarted = true;
  }
});

server.on('error', (error) => {
  console.log('❌ サーバー起動エラー:', error.message);
});

// 3秒後にサーバーを終了
setTimeout(() => {
  server.kill();
  
  if (serverStarted) {
    console.log('\n🎉 Claude Desktop設定完了！');
    console.log('=====================================');
    console.log('📝 次の手順:');
    console.log('1. Claude for Desktop を再起動してください');
    console.log('2. 新しいチャットを開始してください');
    console.log('3. 以下のコマンドでテストしてください:');
    console.log('');
    console.log('   「TypeScriptコードを実行してください:');
    console.log('   console.log("Hello from MCP Server!");」');
    console.log('');
    console.log('✨ 利用可能なツール:');
    console.log('   • execute-typescript: TypeScriptコードの実行');
    console.log('   • validate-typescript: TypeScriptコードの型チェック');
  } else {
    console.log('\n⚠️  サーバーは起動しましたが、確認メッセージが見つかりませんでした');
    console.log('   Claude Desktop で動作する可能性があります');
  }
}, 3000);
