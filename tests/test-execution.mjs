#!/usr/bin/env node

// TypeScript実行とJavaScript実行の直接テスト
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

console.log('🎯 TypeScript & JavaScript 直接実行テスト');
console.log('===========================================\n');

// テスト1: TypeScript実行
console.log('📝 テスト1: TypeScript実行テスト');
const tsCode = `console.log("🟢 TypeScript実行成功！");

interface Calculator {
  add(a: number, b: number): number;
  multiply(a: number, b: number): number;
}

class BasicCalculator implements Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
  
  multiply(a: number, b: number): number {
    return a * b;
  }
}

const calc = new BasicCalculator();
console.log("5 + 3 =", calc.add(5, 3));
console.log("4 × 7 =", calc.multiply(4, 7));

// 配列処理
const numbers: number[] = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("元の配列:", numbers);
console.log("2倍した配列:", doubled);`;

writeFileSync('test-temp.ts', tsCode);

const tsProcess = spawn('npx', ['tsx', 'test-temp.ts'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

tsProcess.stdout.on('data', (data) => {
  console.log('✅ TypeScript出力:', data.toString().trim());
});

tsProcess.stderr.on('data', (data) => {
  console.log('⚠️ TypeScript エラー:', data.toString().trim());
});

tsProcess.on('close', (code) => {
  unlinkSync('test-temp.ts');
  console.log(`TypeScript実行完了 (終了コード: ${code})\n`);
  
  // テスト2: JavaScript実行
  console.log('📝 テスト2: JavaScript実行テスト');
  const jsCode = `console.log("🟡 JavaScript実行成功！");

// 非同期処理のテスト
async function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("データ取得完了！");
    }, 100);
  });
}

// オブジェクト操作
const users = [
  { name: "田中", age: 25 },
  { name: "佐藤", age: 30 },
  { name: "鈴木", age: 28 }
];

console.log("ユーザー一覧:");
users.forEach(user => {
  console.log(\`- \${user.name}さん (\${user.age}歳)\`);
});

// 配列フィルタリング
const adults = users.filter(user => user.age >= 28);
console.log("28歳以上のユーザー:", adults.map(u => u.name).join(", "));

// 非同期実行
fetchData().then(result => {
  console.log("🎉", result);
});`;

  writeFileSync('test-temp.js', jsCode);
  
  const jsProcess = spawn('node', ['test-temp.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  jsProcess.stdout.on('data', (data) => {
    console.log('✅ JavaScript出力:', data.toString().trim());
  });
  
  jsProcess.stderr.on('data', (data) => {
    console.log('⚠️ JavaScript エラー:', data.toString().trim());
  });
  
  jsProcess.on('close', (code) => {
    unlinkSync('test-temp.js');
    console.log(`JavaScript実行完了 (終了コード: ${code})\n`);
    
    // テスト3: 型エラーテスト
    console.log('📝 テスト3: 型エラー検出テスト');
    testTypeErrors();
  });
});

function testTypeErrors() {
  const errorCode = `const x: number = "string";
const y: boolean = 123;
interface User { name: string; age: number; }
const user: User = { name: "test" }; // age プロパティ不足`;

  writeFileSync('test-error.ts', errorCode);
  
  const tscProcess = spawn('npx', ['tsc', '--noEmit', '--strict', 'test-error.ts'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });
  
  tscProcess.stdout.on('data', (data) => {
    console.log('📊 TypeScript型チェック出力:', data.toString().trim());
  });
  
  tscProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('error TS')) {
      console.log('✅ 型エラーが正常に検出されました:');
      console.log(output);
    } else {
      console.log('📊 TypeScript型チェックエラー出力:', output);
    }
  });
  
  tscProcess.on('close', (code) => {
    unlinkSync('test-error.ts');
    console.log(`\n型チェック完了 (終了コード: ${code})`);
    
    if (code !== 0) {
      console.log('✅ 型エラーが正常に検出されました！');
    } else {
      console.log('⚠️ 型エラーが検出されませんでした。');
    }
    
    console.log('\n🎉 全ての直接実行テストが完了しました！');
  });
}
