// JavaScript実行テスト用のサンプルコード

// 基本的な計算と出力
console.log("=== JavaScript実行テスト ===");

const a = 10;
const b = 20;
const result = a + b;
console.log(`${a} + ${b} = ${result}`);

// 配列操作
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("元の配列:", numbers);
console.log("2倍にした配列:", doubled);

// オブジェクト操作
const person = {
  name: "田中太郎",
  age: 30,
  occupation: "エンジニア"
};
console.log("人物情報:", person);

// 関数定義と実行
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("フィボナッチ数列:");
for (let i = 0; i < 10; i++) {
  console.log(`fib(${i}) = ${fibonacci(i)}`);
}

// 非同期処理のテスト
console.log("非同期処理テスト開始...");
setTimeout(() => {
  console.log("1秒後に実行されました！");
}, 1000);

// Promise のテスト
const testPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve("Promiseが完了しました！");
  }, 500);
});

testPromise.then(message => {
  console.log(message);
});

console.log("JavaScript実行テスト完了");
