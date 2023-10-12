// 1. Import the necessary modules for testing.
const assert = require('assert');

// 2. Import the module to be tested.
const { add, subtract } = require('./index');

// 3. Write a test suite using the describe() function.
describe('Math functions', () => {
  // 4. Write individual test cases using the it() function.
  it('should add two numbers', () => {
    // 5. Use assertions to check if the actual output matches the expected output.
    assert.strictEqual(add(2, 3), 5);
    assert.strictEqual(add(-2, 3), 1);
    assert.strictEqual(add(0, 0), 0);
  });

  it('should subtract two numbers', () => {
    assert.strictEqual(subtract(5, 3), 2);
    assert.strictEqual(subtract(-2, 3), -5);
    assert.strictEqual(subtract(0, 0), 0);
  });
});