# TypeScript/JavaScript Code Interpreter MCP Server

TypeScriptとJavaScriptコードを実行するためのModel Context Protocol (MCP) サーバーです。

## 機能

このMCPサーバーは以下の3つのツールを提供します：

### 1. `execute-typescript`
- TypeScriptコードを実行し、結果を返します
- tsx を使用してTypeScriptを直接実行
- 実行時間は安全のため30秒でタイムアウトします
- 一時ファイルは自動的にクリーンアップされます

### 2. `execute-javascript`
- JavaScriptコードを実行し、結果を返します
- Node.js を使用してJavaScriptを実行
- 実行時間は安全のため30秒でタイムアウトします
- 一時ファイルは自動的にクリーンアップされます

### 3. `validate-typescript`
- TypeScriptコードの型チェックのみを行います（実行はしません）
- コードの構文エラーや型エラーを検出できます

## インストールと設定

### 前提条件
- Node.js 16以上
- npm または yarn

### ローカル開発
```bash
# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev

# ビルド
npm run build
```

### Claude for Desktopでの使用

1. Claude for Desktopの設定ファイルを開きます：
   ```bash
   code ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. 以下の設定を追加します：
   ```json
   {
     "mcpServers": {
       "typescript-code-interpreter": {
         "command": "node",
         "args": [
           "/ABSOLUTE/PATH/TO/PROJECT/build/index.js"
         ],
         "env": {}
       }
     }
   }
   ```

3. Claude for Desktopを再起動します

## 使用例

### TypeScriptコードの実行
```typescript
console.log("Hello, TypeScript!");

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("5! =", factorial(5));
```

### JavaScriptコードの実行
```javascript
console.log("Hello, JavaScript!");

// 非同期処理の例
async function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("Data loaded!");
    }, 1000);
  });
}

fetchData().then(data => console.log(data));

// 配列操作の例
const fruits = ["apple", "banana", "orange"];
const upperFruits = fruits.map(fruit => fruit.toUpperCase());
console.log("Fruits:", upperFruits);
```

### 型チェックのみ
```typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Alice",
  age: 30
};

// 型エラーをチェック
const invalidUser: User = {
  name: "Bob"
  // age プロパティが不足 - 型エラーとして検出される
};
```

## セキュリティ考慮事項

- コード実行は一時ファイルを使用し、実行後に自動削除されます
- 30秒の実行タイムアウトが設定されています
- ファイルシステムアクセスは一時ディレクトリに制限されています
- TypeScriptとJavaScript両方に同等のセキュリティ制限が適用されます

## 提供される機能詳細

### TypeScript実行 (`execute-typescript`)
- **実行エンジン**: tsx
- **対応機能**: ES2022の全機能、型注釈、インターフェース、ジェネリクス等
- **出力**: 標準出力、標準エラー出力、実行結果
- **エラーハンドリング**: TypeScriptコンパイルエラーと実行時エラーの両方をキャッチ

### JavaScript実行 (`execute-javascript`)
- **実行エンジン**: Node.js
- **対応機能**: ES2022の全機能、非同期処理、Node.js標準ライブラリ
- **出力**: 標準出力、標準エラー出力、実行結果
- **エラーハンドリング**: 実行時エラーとプロミス拒否をキャッチ

### TypeScript検証 (`validate-typescript`)
- **検証エンジン**: TypeScript Compiler API
- **対応機能**: 型チェック、構文チェック、セマンティック解析
- **出力**: エラー詳細（行番号、列番号、エラーメッセージ）
- **用途**: コード実行前の安全性確認

## 技術仕様

- **言語**: TypeScript
- **TypeScript実行**: tsx (TypeScript Execute)
- **JavaScript実行**: Node.js
- **MCP SDK**: @modelcontextprotocol/sdk
- **型チェック**: TypeScript Compiler API
- **バリデーション**: Zod

## トラブルシューティング

### よくある問題

1. **tsx が見つからないエラー**
   ```bash
   npm install tsx
   ```

2. **Node.js のバージョンエラー**
   - Node.js 16以上が必要です
   ```bash
   node --version
   ```

3. **実行権限エラー**
   ```bash
   chmod 755 build/index.js
   ```

4. **Claude for Desktopで認識されない**
   - 設定ファイルのパスが絶対パスになっているか確認
   - Claude for Desktopを完全に再起動
   - ログファイルを確認: `~/Library/Logs/Claude/mcp*.log`

5. **コード実行がタイムアウトする**
   - 実行時間は30秒に制限されています
   - 長時間実行されるコードは避けてください
   - 無限ループなどの処理は自動的に停止されます

## テスト

プロジェクトには包括的なテストスイートが含まれています：

```bash
# 基本的なサーバー動作テスト
npm test

# または個別のテストファイルを実行
node test-mcp.mjs              # 基本動作確認
node test-enhanced.mjs         # TypeScript + JavaScript機能テスト
node test-mcp-communication.mjs # MCPプロトコル通信テスト
```

### テストファイル
- `test-code.ts` - TypeScript実行テスト用サンプルコード
- `test-javascript.js` - JavaScript実行テスト用サンプルコード  
- `test-error-code.ts` - 型エラーテスト用サンプルコード
- `comprehensive-test.js` - 総合的なテストスイート

## パフォーマンス

- **起動時間**: 通常1秒以内
- **TypeScript実行**: tsx による高速実行
- **JavaScript実行**: Node.js ネイティブ実行
- **メモリ使用量**: 実行後の自動クリーンアップによりメモリリークを防止
- **同時実行**: 複数のコード実行要求を安全に処理

## ライセンス

ISC

## 貢献

プルリクエストや課題報告を歓迎します。
