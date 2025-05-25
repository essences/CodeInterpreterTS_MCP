#!/usr/bin/env node

console.log('🎯 TypeScript Code Interpreter MCP Server 総合テスト');
console.log('====================================================');

// 環境確認
console.log('\n📋 環境確認:');
console.log('Node.js バージョン:', process.version);
console.log('プラットフォーム:', process.platform);
console.log('アーキテクチャ:', process.arch);

// ファイル存在確認
import fs from 'fs';
import path from 'path';

console.log('\n📁 ファイル確認:');
const requiredFiles = [
  'build/index.js',
  'src/index.ts',
  'package.json',
  'tsconfig.json'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
  }
});

// 依存関係確認
console.log('\n📦 主要依存関係確認:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  const requiredDeps = [
    '@modelcontextprotocol/sdk',
    'zod',
    'tsx',
    '@types/node'
  ];
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep] || (packageJson.devDependencies && packageJson.devDependencies[dep])) {
      console.log(`✅ ${dep} - インストール済み`);
    } else {
      console.log(`❌ ${dep} - 未インストール`);
    }
  });
} catch (error) {
  console.log('❌ package.json読み込みエラー:', error.message);
}

// Claude for Desktop設定情報
console.log('\n🔧 Claude for Desktop 設定情報:');
console.log('以下の設定を claude_desktop_config.json に追加してください:');
console.log('');
console.log(JSON.stringify({
  "mcpServers": {
    "typescript-code-interpreter": {
      "command": "node",
      "args": [path.resolve('build/index.js')]
    }
  }
}, null, 2));

console.log('\n📍 設定ファイルの場所:');
console.log('macOS: ~/Library/Application Support/Claude/claude_desktop_config.json');
console.log('Windows: %APPDATA%\\Claude\\claude_desktop_config.json');

// サンプルコード
console.log('\n📝 テスト用サンプルコード:');
console.log('Claude for Desktopで以下のコードを試してください:');
console.log('');
console.log('--- TypeScript実行テスト ---');
console.log(`
console.log("Hello, TypeScript MCP Server!");

interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "サンプルユーザー",
  age: 25
};

console.log("ユーザー情報:", user);

function greet(user: User): string {
  return \`こんにちは、\${user.name}さん！あなたは\${user.age}歳ですね。\`;
}

console.log(greet(user));
`);

console.log('--- 型チェックテスト ---');
console.log(`
interface Product {
  id: number;
  name: string;
  price: number;
}

// 正常なオブジェクト
const validProduct: Product = {
  id: 1,
  name: "サンプル商品",
  price: 1000
};

// 型エラーのあるオブジェクト
const invalidProduct: Product = {
  id: 2,
  name: "エラー商品"
  // price プロパティが不足 - 型エラーになるはず
};
`);

console.log('\n✅ テスト準備完了！');
console.log('Claude for Desktop を設定して、上記のコードを試してみてください。');
