# TypeScript Code Interpreter MCP Server

TypeScriptコードを実行するためのModel Context Protocol (MCP) サーバーです。

## 機能

このMCPサーバーは以下の2つのツールを提供します：

### 1. `execute-typescript`
- TypeScriptコードを実行し、結果を返します
- 実行時間は安全のため30秒でタイムアウトします
- 一時ファイルは自動的にクリーンアップされます

### 2. `validate-typescript`
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
         ]
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

## 技術仕様

- **言語**: TypeScript
- **実行環境**: tsx (TypeScript Execute)
- **MCP SDK**: @modelcontextprotocol/sdk
- **型チェック**: TypeScript Compiler API

## トラブルシューティング

### よくある問題

1. **tsx が見つからないエラー**
   ```bash
   npm install tsx
   ```

2. **実行権限エラー**
   ```bash
   chmod 755 build/index.js
   ```

3. **Claude for Desktopで認識されない**
   - 設定ファイルのパスが絶対パスになっているか確認
   - Claude for Desktopを完全に再起動
   - ログファイルを確認: `~/Library/Logs/Claude/mcp*.log`

## ライセンス

ISC

## 貢献

プルリクエストや課題報告を歓迎します。
