// Safe TypeScript code sample
const message: string = "Hello, World!";
const numbers: number[] = [1, 2, 3, 4, 5];

function calculateSum(arr: number[]): number {
  return arr.reduce((sum, num) => sum + num, 0);
}

const result = calculateSum(numbers);
console.log(`${message} Sum: ${result}`);

// Safe file operations (should be allowed)
const data = "test data";
console.log(data.length);
