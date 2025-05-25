// テスト用のTypeScriptコード
console.log("🎯 TypeScript Code Interpreter テスト開始");

// 基本的なTypeScript機能のテスト
const message: string = "Hello, TypeScript MCP Server!";
console.log(message);

// 配列操作のテスト
const numbers: number[] = [1, 2, 3, 4, 5];
const doubled = numbers.map((n: number) => n * 2);
console.log("元の配列:", numbers);
console.log("2倍にした配列:", doubled);

// 関数のテスト
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("フィボナッチ数列:");
for (let i = 0; i < 10; i++) {
  console.log(`F(${i}) = ${fibonacci(i)}`);
}

// インターフェースのテスト
interface Person {
  name: string;
  age: number;
  hobbies: string[];
}

const person: Person = {
  name: "太郎",
  age: 25,
  hobbies: ["読書", "プログラミング", "映画鑑賞"]
};

console.log("人物情報:", JSON.stringify(person, null, 2));

// クラスのテスト
class Calculator {
  private history: string[] = [];

  add(a: number, b: number): number {
    const result = a + b;
    this.history.push(`${a} + ${b} = ${result}`);
    return result;
  }

  multiply(a: number, b: number): number {
    const result = a * b;
    this.history.push(`${a} × ${b} = ${result}`);
    return result;
  }

  getHistory(): string[] {
    return this.history;
  }
}

const calc = new Calculator();
console.log("10 + 5 =", calc.add(10, 5));
console.log("3 × 7 =", calc.multiply(3, 7));
console.log("計算履歴:", calc.getHistory());

console.log("✅ TypeScript Code Interpreter テスト完了！");
