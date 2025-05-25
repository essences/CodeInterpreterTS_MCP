#!/usr/bin/env node

import { spawn } from 'child_process';
import { createReadStream, createWriteStream } from 'fs';

console.log('🚀 TypeScript Code Interpreter MCP Server テスト開始\n');

// テスト1: サーバーの基本動作確認
console.log('📋 テスト1: サーバーの基本動作確認');
try {
  const server = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let hasOutput = false;
  
  server.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('TypeScript Code Interpreter MCP Server running')) {
      console.log('✅ サーバーが正常に起動しました');
      hasOutput = true;
    }
    console.log('Server:', output.trim());
  });

  server.on('error', (error) => {
    console.log('❌ サーバー起動エラー:', error.message);
  });

  // 2秒後にサーバーを終了
  setTimeout(() => {
    server.kill();
    if (!hasOutput) {
      console.log('⚠️  サーバーからの出力を確認できませんでしたが、エラーもありませんでした');
    }
    runNextTest();
  }, 2000);

} catch (error) {
  console.log('❌ テスト1失敗:', error.message);
  runNextTest();
}

function runNextTest() {
  console.log('\n📋 テスト2: TypeScript実行エンジンの確認');
  
  // tsxが利用可能かテスト
  const tsxTest = spawn('npx', ['tsx', '--version'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  tsxTest.stdout.on('data', (data) => {
    console.log('✅ tsx バージョン:', data.toString().trim());
  });

  tsxTest.stderr.on('data', (data) => {
    console.log('tsx stderr:', data.toString().trim());
  });

  tsxTest.on('close', (code) => {
    if (code === 0) {
      console.log('✅ TypeScript実行環境が正常に動作しています');
    } else {
      console.log('❌ TypeScript実行環境にエラーがあります');
    }
    runFinalTest();
  });

  tsxTest.on('error', (error) => {
    console.log('❌ tsx確認エラー:', error.message);
    runFinalTest();
  });
}

function runFinalTest() {
  console.log('\n📋 テスト3: TypeScriptコンパイラーの確認');
  
  const tscTest = spawn('npx', ['tsc', '--version'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  tscTest.stdout.on('data', (data) => {
    console.log('✅ TypeScriptコンパイラー バージョン:', data.toString().trim());
  });

  tscTest.on('close', (code) => {
    if (code === 0) {
      console.log('✅ TypeScript型チェック環境が正常に動作しています');
    } else {
      console.log('❌ TypeScript型チェック環境にエラーがあります');
    }
    
    console.log('\n🎉 テスト完了！');
    console.log('=====================================');
    console.log('MCPサーバーは以下の機能を提供します：');
    console.log('• execute-typescript: TypeScriptコードの実行');
    console.log('• validate-typescript: TypeScriptコードの型チェック');
    console.log('');
    console.log('Claude for Desktopで使用するには:');
    console.log('1. claude_desktop_config.json に設定を追加');
    console.log('2. Claude for Desktop を再起動');
    console.log('3. TypeScriptコードの実行をお試しください！');
  });

  tscTest.on('error', (error) => {
    console.log('❌ tsc確認エラー:', error.message);
    console.log('\n⚠️  テスト完了（一部エラーあり）');
  });
}
