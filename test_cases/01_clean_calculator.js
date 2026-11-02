/**
 * Test Case 01: Clean Calculator
 * Language: JavaScript (.js)
 * Expected Result: Excellent (Score 95 - 100)
 * Description: Clean, modern code with robust validation and no security flaws or syntax errors.
 */

class SafeCalculator {
  constructor() {
    this.history = [];
  }

  add(a, b) {
    this.validateNumbers(a, b);
    const result = a + b;
    this.record('ADD', a, b, result);
    return result;
  }

  subtract(a, b) {
    this.validateNumbers(a, b);
    const result = a - b;
    this.record('SUBTRACT', a, b, result);
    return result;
  }

  multiply(a, b) {
    this.validateNumbers(a, b);
    const result = a * b;
    this.record('MULTIPLY', a, b, result);
    return result;
  }

  divide(a, b) {
    this.validateNumbers(a, b);
    if (b === 0) {
      throw new Error('Division by zero is not allowed.');
    }
    const result = a / b;
    this.record('DIVIDE', a, b, result);
    return result;
  }

  validateNumbers(...values) {
    for (const val of values) {
      if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
        throw new TypeError('All inputs must be valid finite numbers.');
      }
    }
  }

  record(operation, operandA, operandB, result) {
    this.history.push({
      timestamp: new Date().toISOString(),
      operation,
      operands: [operandA, operandB],
      result,
    });
  }

  getHistory() {
    return [...this.history];
  }
}

const calc = new SafeCalculator();
const total = calc.add(10, 25);
console.log('Calculation successful:', total);
