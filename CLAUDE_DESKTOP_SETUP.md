# Claude Desktop設定方法

## 1. 設定ファイルの場所
macOSの場合、Claude Desktopの設定ファイルは以下の場所にあります：
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

## 2. 設定の適用方法

### 方法1: 手動でコピー
```bash
# 設定ファイルをClaude Desktopの設定ディレクトリにコピー
cp config/claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### 方法2: 既存の設定に追加
既存の設定がある場合は、以下の内容を手動で追加してください：

```json
{
  "mcpServers": {
    "typescript-code-interpreter": {
      "command": "node",
      "args": [
        "/Users/hayashieiichi/workspace/CodeInterpreterMCP/CodeInterpreterTS_MCP/build/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 3. Claude Desktopの再起動
設定を適用した後、Claude Desktopを再起動してください。

## 4. 確認方法
Claude Desktopで以下のことを確認できます：
- MCPサーバーが正常に接続されている
- TypeScript/JavaScriptコードの実行ができる
- セキュリティ機能が動作している

## 5. 使用例
Claude Desktopで以下のようなリクエストができます：
- "TypeScriptコードを実行してください"
- "JavaScriptでファイルを読み取ってください"
- "コードの安全性を確認してください"

## 注意事項
- パスは絶対パスで指定されています
- セキュリティ機能により、許可されたディレクトリのみアクセス可能
- 危険なコードの実行は自動的にブロックされます
