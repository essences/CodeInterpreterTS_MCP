# TypeScript/JavaScript Code Interpreter MCP Server

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-23.x-green)
![MCP](https://img.shields.io/badge/MCP-Protocol-orange)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

高性能なTypeScript/JavaScript Code InterpreterのMCP (Model Context Protocol) Serverです。TypeScriptとJavaScriptコードの実行、型チェック、大容量ファイルの統計計算に対応しています。

## 🎯 主な機能

### 📝 コード実行
- **TypeScript実行**: 最新のTypeScript構文に対応した高速実行
- **JavaScript実行**: ES2023+対応のJavaScript実行環境
- **型チェック**: TypeScript Compiler APIによる高精度型検証
- **セキュリティ**: 30秒実行タイムアウト、テンポラリファイル自動クリーンアップ

### 📊 データ処理・統計計算
- **大容量ファイル**: 100万行+の大規模データファイル対応
- **複数フォーマット**: CSV、Excel(.xlsx)、JSON、テキストファイル
- **高速統計計算**: 合計、平均、標準偏差、分散、最小値、最大値
- **メモリ効率**: ストリーミング処理による低メモリ消費

### 📈 Excel操作機能
- **読み取り**: .xlsxファイルの高速読み込み
- **書き込み**: データからExcelファイル生成
- **大容量対応**: 5万行以上のExcelファイル処理
- **統計処理**: Excel内データの包括的統計計算

## 🚀 パフォーマンス

| 機能 | 性能指標 |
|------|----------|
| データ処理速度 | 1,500,000行/秒 |
| ファイル読み取り | 94 MB/秒 |
| Excel作成 | 80,000行/秒 |
| TypeScript実行 | <100ms (中規模コード) |
| 統計計算 | 100万行を665ms |

## 📁 プロジェクト構造

```
CodeInterpreterTS_MCP/
├── src/                    # ソースコード
│   └── index.ts           # メインサーバー実装
├── build/                 # コンパイル済みJS
│   └── index.js
├── tests/                 # テストファイル
│   ├── test-*.mjs         # 統合テスト
│   ├── test-*.ts          # TypeScript型テスト
│   └── comprehensive-test.js
├── examples/              # サンプルデータ
│   ├── sample-numbers.txt # 数値データサンプル
│   ├── sample-data.json   # JSONデータサンプル
│   ├── sample-csv.csv     # CSVデータサンプル
│   └── large-data/        # 大容量テストデータ
│       ├── large-test-data.csv  (62.52MB, 100万行)
│       └── large-test-data.xlsx (12.46MB, 5万行)
├── scripts/               # ユーティリティスクリプト
│   ├── create-excel-test.cjs # Excel作成スクリプト
│   └── read-excel-test.cjs   # Excel読み取りスクリプト
├── docs/                  # ドキュメント
│   ├── IMPLEMENTATION_COMPLETE.md
│   └── LARGE_FILE_TEST_RESULTS.md
└── README.md              # このファイル
```

## 🛠 インストール

### 前提条件
- Node.js 18.0.0 以上
- npm または yarn
- TypeScript 5.0 以上

### セットアップ
```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/CodeInterpreterTS_MCP.git
cd CodeInterpreterTS_MCP

# 依存関係をインストール
npm install

# ビルド
npm run build

# 開発モードで実行（テスト用）
npm run dev

# テストの実行
npm run test:all
```

### 利用可能なスクリプト
```bash
npm run build          # TypeScriptをJavaScriptにコンパイル
npm run dev            # 開発モードでサーバーを起動
npm run start          # ビルド済みサーバーを起動
npm run test           # 包括的テストスイートを実行
npm run test:mcp       # 基本的なMCP通信テスト
npm run test:enhanced  # 高度な機能テスト
npm run test:communication # プロトコル通信テスト
npm run test:all       # すべてのテストを実行
npm run clean          # ビルド成果物をクリーンアップ
npm run excel:create   # Excel作成テスト
npm run excel:read     # Excel読み取りテスト
```

## 🔧 Claude for Desktopでの設定

### 1. プロジェクトのビルド
```bash
npm run build
```

### 2. 設定ファイルの場所
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### 3. 設定の追加
設定ファイルに以下を追加（**パスを実際のプロジェクトパスに変更**）：

```json
{
  "mcpServers": {
    "typescript-code-interpreter": {
      "command": "node",
      "args": [
        "/Users/yourpath/CodeInterpreterTS_MCP/build/index.js"
      ],
      "env": {}
    }
  }
}
```

**重要**: `/Users/yourpath/`を実際のプロジェクトパスに変更してください。

### 4. Claude for Desktopの再起動
設定を変更後、Claude for Desktopを完全に再起動してください。

### 5. 動作確認
以下のメッセージでテストできます：
```
TypeScriptコードを実行してください: 
console.log('Hello from MCP Server!');
console.log('現在時刻:', new Date().toLocaleString());
```

## 📖 使用例

### 🔰 基本的なTypeScript実行
```typescript
console.log("Hello, TypeScript!");

// 型安全な配列操作
const numbers: number[] = [1, 2, 3, 4, 5];
const doubled = numbers.map((n: number) => n * 2);
console.log("Doubled numbers:", doubled);

// インターフェースと関数
interface User {
  name: string;
  age: number;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}! You are ${user.age} years old.`;
}

const user: User = { name: "Alice", age: 30 };
console.log(greetUser(user));

// 階乗計算（再帰関数）
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("5! =", factorial(5));
```

### 🚀 高度なJavaScript実行
```javascript
console.log("Hello, JavaScript!");

// 非同期処理とPromise
async function fetchUserData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: "John Doe",
        email: "john@example.com"
      });
    }, 1000);
  });
}

// async/await を使用
(async () => {
  try {
    const user = await fetchUserData();
    console.log("User data:", user);
  } catch (error) {
    console.error("Error:", error);
  }
})();

// 配列の高度な操作
const fruits = ["apple", "banana", "orange", "grape"];
const result = fruits
  .filter(fruit => fruit.length > 5)
  .map(fruit => fruit.toUpperCase())
  .sort();

console.log("Filtered and sorted fruits:", result);

// オブジェクトの操作
const data = [
  { category: "fruit", name: "apple", price: 100 },
  { category: "fruit", name: "banana", price: 80 },
  { category: "vegetable", name: "carrot", price: 60 }
];

const groupedByCategory = data.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }
  acc[item.category].push(item);
  return acc;
}, {});

console.log("Grouped data:", groupedByCategory);
```

### 📊 実践的なデータ処理

#### CSVファイルの統計分析（100万行対応）
```typescript
import * as fs from 'fs';

// 大容量数値データの統計計算
const numbersText = fs.readFileSync('examples/sample-numbers.txt', 'utf-8');
const numbers = numbersText
  .split('\n')
  .filter(line => line.trim())
  .map(num => parseFloat(num))
  .filter(num => !isNaN(num));

// 統計計算関数
function calculateStatistics(data: number[]) {
  const sorted = [...data].sort((a, b) => a - b);
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / data.length;
  
  // 分散と標準偏差
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  // 中央値
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  return {
    count: data.length,
    sum: sum,
    mean: mean,
    median: median,
    min: Math.min(...data),
    max: Math.max(...data),
    variance: variance,
    standardDeviation: stdDev,
    range: Math.max(...data) - Math.min(...data)
  };
}

const stats = calculateStatistics(numbers);
console.log('📊 統計結果:');
console.log(`データ数: ${stats.count.toLocaleString()}`);
console.log(`合計: ${stats.sum.toLocaleString()}`);
console.log(`平均: ${stats.mean.toFixed(2)}`);
console.log(`中央値: ${stats.median.toFixed(2)}`);
console.log(`最小値: ${stats.min}`);
console.log(`最大値: ${stats.max}`);
console.log(`標準偏差: ${stats.standardDeviation.toFixed(2)}`);
console.log(`分散: ${stats.variance.toFixed(2)}`);
console.log(`範囲: ${stats.range.toFixed(2)}`);
```

#### JSONデータの高速処理
```typescript
import * as fs from 'fs';

// JSONファイルの読み込みと分析
const jsonData = JSON.parse(fs.readFileSync('examples/sample-data.json', 'utf-8'));

// データ型の確認と統計
console.log('📋 JSONデータ分析:');
console.log(`総レコード数: ${jsonData.length.toLocaleString()}`);

// カテゴリ別の集計
const categoryStats = jsonData.reduce((acc: any, item: any) => {
  const category = item.category || 'unknown';
  if (!acc[category]) {
    acc[category] = { count: 0, totalValue: 0, items: [] };
  }
  acc[category].count++;
  acc[category].totalValue += item.value || 0;
  acc[category].items.push(item.name);
  return acc;
}, {});

Object.entries(categoryStats).forEach(([category, stats]: [string, any]) => {
  console.log(`\n📁 ${category}:`);
  console.log(`  件数: ${stats.count}`);
  console.log(`  平均値: ${(stats.totalValue / stats.count).toFixed(2)}`);
  console.log(`  アイテム例: ${stats.items.slice(0, 3).join(', ')}${stats.items.length > 3 ? '...' : ''}`);
});
```

#### Excel データ作成と読み取り
```typescript
import * as XLSX from 'xlsx';

// 大容量Excelファイルの作成
const data = Array.from({ length: 50000 }, (_, i) => ({
  ID: i + 1,
  Name: `User${i + 1}`,
  Value: Math.random() * 1000,
  Date: new Date(2024, 0, 1 + (i % 365)).toISOString().split('T')[0]
}));

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'LargeData');

// ファイルに書き出し
XLSX.writeFile(workbook, 'examples/large-data/generated-data.xlsx');

console.log(`${data.length.toLocaleString()}行のExcelファイルを作成しました`);

// Excelファイルの読み取りと統計計算
const readWorkbook = XLSX.readFile('examples/large-data/large-test-data.xlsx');
const sheetName = readWorkbook.SheetNames[0];
const sheet = readWorkbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(sheet);

const numericValues = jsonData
  .map(row => parseFloat(row.Value))
  .filter(v => !isNaN(v));

const statistics = {
  rowCount: jsonData.length,
  numericCount: numericValues.length,
  sum: numericValues.reduce((a, b) => a + b, 0),
  average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
  min: Math.min(...numericValues),
  max: Math.max(...numericValues)
};

console.log('Excel統計結果:', statistics);
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
