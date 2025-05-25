#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

console.log('🚀 TypeScript & JavaScript Code Interpreter MCP Server テスト開始\n');

// テスト1: サーバーの基本動作確認
console.log('📋 テスト1: サーバーの基本動作確認');
try {
  const server = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let hasOutput = false;
  
  server.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('TypeScript & JavaScript Code Interpreter MCP Server running')) {
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
    runJavaScriptTest();
  }, 2000);

} catch (error) {
  console.log('❌ テスト1失敗:', error.message);
  runJavaScriptTest();
}

function runJavaScriptTest() {
  console.log('\n📋 テスト2: JavaScript実行環境の確認');
  
  // Node.jsが利用可能かテスト
  const nodeTest = spawn('node', ['--version'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  nodeTest.stdout.on('data', (data) => {
    console.log('✅ Node.js バージョン:', data.toString().trim());
  });

  nodeTest.stderr.on('data', (data) => {
    console.log('Node.js stderr:', data.toString().trim());
  });

  nodeTest.on('close', (code) => {
    if (code === 0) {
      console.log('✅ JavaScript実行環境が正常に動作しています');
    } else {
      console.log('❌ JavaScript実行環境にエラーがあります');
    }
    runTypeScriptTest();
  });

  nodeTest.on('error', (error) => {
    console.log('❌ Node.js確認エラー:', error.message);
    runTypeScriptTest();
  });
}

function runTypeScriptTest() {
  console.log('\n📋 テスト3: TypeScript実行環境の確認');
  
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
    runSampleTests();
  });

  tsxTest.on('error', (error) => {
    console.log('❌ tsx確認エラー:', error.message);
    runSampleTests();
  });
}

function runSampleTests() {
  console.log('\n📋 テスト4: JavaScript サンプルコード実行テスト');
  
  try {
    const jsCode = readFileSync('test-javascript.js', 'utf-8');
    const jsTest = spawn('node', ['-e', jsCode], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let jsOutput = '';
    jsTest.stdout.on('data', (data) => {
      jsOutput += data.toString();
    });

    jsTest.on('close', (code) => {
      if (code === 0) {
        console.log('✅ JavaScript サンプルコードが正常に実行されました');
        console.log('出力プレビュー:', jsOutput.split('\n').slice(0, 3).join('\n'), '...');
      } else {
        console.log('❌ JavaScript サンプルコード実行エラー');
      }
      runFinalTest();
    });

  } catch (error) {
    console.log('❌ JavaScript サンプルテスト実行エラー:', error.message);
    runFinalTest();
  }
}

function runFinalTest() {
  console.log('\n📋 テスト5: TypeScript サンプルコード実行テスト');
  
  try {
    const tsCode = readFileSync('test-code.ts', 'utf-8');
    const tsTest = spawn('npx', ['tsx', '-e', tsCode], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let tsOutput = '';
    tsTest.stdout.on('data', (data) => {
      tsOutput += data.toString();
    });

    tsTest.on('close', (code) => {
      if (code === 0) {
        console.log('✅ TypeScript サンプルコードが正常に実行されました');
        console.log('出力プレビュー:', tsOutput.split('\n').slice(0, 3).join('\n'), '...');
      } else {
        console.log('❌ TypeScript サンプルコード実行エラー');
      }
      
      console.log('\n🎉 全テスト完了！');
      console.log('=====================================');
      console.log('MCPサーバーは以下の機能を提供します：');
      console.log('• execute-typescript: TypeScriptコードの実行');
      console.log('• execute-javascript: JavaScriptコードの実行');
      console.log('• validate-typescript: TypeScriptコードの型チェック');
      console.log('');
      console.log('Claude for Desktopで使用するには:');
      console.log('1. claude_desktop_config.json の設定を確認');
      console.log('2. Claude for Desktop を再起動');
      console.log('3. TypeScript/JavaScriptコードの実行をお試しください！');
    });

  } catch (error) {
    console.log('❌ TypeScript サンプルテスト実行エラー:', error.message);
    console.log('\n⚠️  テスト完了（一部エラーあり）');
  }
}
