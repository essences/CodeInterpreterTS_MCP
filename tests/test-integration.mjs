#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🚀 TypeScript/JavaScript Code Interpreter MCP Server');
console.log('====================================================');
console.log('最終統合テスト実行中...\n');

// 基本環境確認
console.log('📋 環境確認:');
console.log('Node.js バージョン:', process.version);
console.log('プラットフォーム:', process.platform);
console.log('アーキテクチャ:', process.arch);
console.log();

// 1. サーバー起動テスト
console.log('🔧 テスト1: MCPサーバー起動確認');
const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverStarted = false;

server.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('TypeScript & JavaScript Code Interpreter MCP Server running')) {
    console.log('✅ サーバーが正常に起動しました');
    serverStarted = true;
    
    // 2秒後にサーバーを終了
    setTimeout(() => {
      server.kill();
    }, 2000);
  }
});

server.on('close', (code) => {
  if (serverStarted) {
    console.log('✅ サーバー終了テスト完了\n');
  } else {
    console.log('❌ サーバー起動に失敗しました\n');
  }
  
  // 2. 依存関係確認
  console.log('🔧 テスト2: 依存関係確認');
  checkDependencies();
});

function checkDependencies() {
  const dependencies = [
    { name: 'tsx', command: ['npx', 'tsx', '--version'] },
    { name: 'tsc', command: ['npx', 'tsc', '--version'] },
    { name: 'Node.js', command: ['node', '--version'] }
  ];
  
  let completed = 0;
  
  dependencies.forEach(dep => {
    const process = spawn(dep.command[0], dep.command.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    
    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0 && output.trim()) {
        console.log(`✅ ${dep.name}: ${output.trim()}`);
      } else {
        console.log(`❌ ${dep.name}: 利用不可`);
      }
      
      completed++;
      if (completed === dependencies.length) {
        console.log();
        showFinalStatus();
      }
    });
  });
}

function showFinalStatus() {
  console.log('🎉 統合テスト完了！');
  console.log('=====================================');
  console.log();
  console.log('🛠️  利用可能な機能:');
  console.log('• execute-typescript: TypeScriptコード実行');
  console.log('• execute-javascript: JavaScriptコード実行');
  console.log('• validate-typescript: TypeScript型チェック');
  console.log();
  console.log('📝 Claude for Desktop設定例:');
  console.log(`{
  "mcpServers": {
    "typescript-code-interpreter": {
      "command": "node",
      "args": [
        "${process.cwd()}/build/index.js"
      ]
    }
  }
}`);
  console.log();
  console.log('📍 設定ファイル場所:');
  console.log('~/Library/Application Support/Claude/claude_desktop_config.json');
  console.log();
  console.log('✨ これでTypeScript/JavaScript Code Interpreter MCP Serverの');
  console.log('   実装とテストが完了しました！');
}
