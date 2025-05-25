#!/bin/bash

echo "🧪 MCP プロトコル通信テスト"
echo "================================"

# MCPサーバーをバックグラウンドで起動
node build/index.js &
SERVER_PID=$!

sleep 1

echo "📡 初期化メッセージ送信中..."

# 初期化メッセージ
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node build/index.js &

sleep 1

echo "📡 ツール一覧取得中..."

# ツール一覧取得
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node build/index.js &

sleep 1

echo "📡 TypeScriptコード実行テスト..."

# TypeScriptコード実行テスト
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"execute-typescript","arguments":{"code":"console.log(\"Hello from MCP!\");\nconst result = 2 + 3;\nconsole.log(\"2 + 3 =\", result);"}}}' | node build/index.js &

sleep 2

# プロセス終了
kill $SERVER_PID 2>/dev/null || true

echo "✅ MCP通信テスト完了"
