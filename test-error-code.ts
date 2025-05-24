// 型エラーを含むテストコード
interface User {
  name: string;
  age: number;
  email: string;
}

// 正常なコード
const validUser: User = {
  name: "田中太郎",
  age: 30,
  email: "tanaka@example.com"
};

// 型エラーを含むコード（プロパティ不足）
const invalidUser: User = {
  name: "佐藤花子",
  age: 25
  // email プロパティが不足している
};

// 型エラーを含むコード（型不一致）
const wrongTypeUser: User = {
  name: "山田次郎",
  age: "三十歳", // number型ではなくstring型
  email: "yamada@example.com"
};
