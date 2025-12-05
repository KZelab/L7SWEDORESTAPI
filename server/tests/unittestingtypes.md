
This guide will walk you through the most common types of unit tests you can write with Jest, complete with commented examples.

## Core Concepts

- `describe(name, fn)`: Creates a block that groups together several related tests. This is useful for organizing your test file.
    
- `test(name, fn)` or `it(name, fn)`: This is the test case itself. `it` is just an alias for `test`.
    
- `expect(value)`: This is the assertion. You wrap a value you want to test with `expect()`.
    
- **Matchers**: These are the methods you chain onto `expect()` to check the value. For example, `.toBe()`, `.toEqual()`, `.toBeTruthy()`.
    

## 1. Basic Function Tests (Synchronous)

These are the most common tests. They check the output of a pure function given a specific input.

### Example 1.1: Simple Primitives (using `.toBe()`)

`.toBe()` checks for strict equality (`===`), which is best for primitive values like strings, numbers, and booleans.

```
// Function to be tested
function add(a, b) {
  return a + b;
}

// Test suite
describe('add function', () => {
  // Test case
  it('should return 5 when adding 2 and 3', () => {
    // Arrange: Set up your variables
    const num1 = 2;
    const num2 = 3;
    const expected = 5;

    // Act: Call the function
    const result = add(num1, num2);

    // Assert: Check if the result is what you expect
    expect(result).toBe(expected);
  });
});
```

### Example 1.2: Objects & Arrays (using `.toEqual()`)

`.toEqual()` recursively checks every field of an object or array. Use this instead of `.toBe()` for non-primitive values.

```
// Function to be tested
function createPerson(name, age) {
  return { name, age, id: Math.random() };
}

// Test suite
describe('createPerson function', () => {
  // Test case
  it('should create an object with the correct name and age', () => {
    // We can't know the `id`, so we use `expect.objectContaining`
    const expected = {
      name: 'Alice',
      age: 30,
    };

    // Assert
    expect(createPerson('Alice', 30)).toEqual(
      // `expect.objectContaining` checks that the received object
      // contains *at least* these properties.
      expect.objectContaining(expected)
    );

    // We can also check that it has the 'id' property
    expect(createPerson('Alice', 30)).toHaveProperty('id');
  });
});
```

### Example 1.3: Truthiness Matchers

Sometimes you don't care about the exact value, just whether it's `true`, `false`, `null`, or `undefined`.

```
describe('Truthiness matchers', () => {
  it('should correctly identify null, undefined, and boolean values', () => {
    const n = null;
    const u = undefined;
    const t = true;
    const f = false;

    expect(n).toBeNull();
    expect(u).toBeUndefined();
    expect(t).toBeTruthy(); // Matches anything that an if statement treats as true
    expect(f).toBeFalsy(); // Matches anything that an if statement treats as false
  });
});
```

### Example 1.4: Numbers Matchers

Jest provides helpers for numerical comparisons.

```
describe('Numbers matchers', () => {
  it('should handle number comparisons', () => {
    const value = 2 + 2;
    expect(value).toBeGreaterThan(3);
    expect(value).toBeGreaterThanOrEqual(4);
    expect(value).toBeLessThan(5);
    expect(value).toBeLessThanOrEqual(4);
  });

  it('should handle floating point numbers', () => {
    const value = 0.1 + 0.2;
    // expect(value).toBe(0.3); // This will FAIL due to floating point precision
    expect(value).toBeCloseTo(0.3); // This will PASS
  });
});
```

### Example 1.5: String Matchers (using `.toMatch()`)

You can check strings against regular expressions.

```
describe('String matchers', () => {
  it('should find "stop" in "Stop! Hammertime!"', () => {
    const text = 'Stop! Hammertime!';
    // You can use a simple string
    expect(text).toMatch('stop');
    // Or a regular expression for case-insensitivity
    expect(text).toMatch(/stop/i);
  });
});
```

### Example 1.6: Array Matchers (using `.toContain()`)

You can check if an array contains a specific item.

```
describe('Array matchers', () => {
  it('should contain "milk" in the shopping list', () => {
    const shoppingList = ['bread', 'milk', 'eggs', 'cheese'];
    expect(shoppingList).toContain('milk');
    expect(shoppingList).not.toContain('bananas');
  });
});
```

### Example 1.7: Testing for Errors (using `.toThrow()`)

You can test that a function throws an error under specific conditions.

```
// Function to be tested
function compileCode(language) {
  if (language === 'klingon') {
    throw new Error('ERROR: Unknown language!');
  }
  return true;
}

describe('compileCode function', () => {
  it('should throw an error for an unknown language', () => {
    // You must wrap the code that throws in an arrow function
    // for `toThrow` to work correctly.
    expect(() => compileCode('klingon')).toThrow();

    // You can also check for the specific error message
    expect(() => compileCode('klingon')).toThrow('ERROR: Unknown language!');
  });
});
```

## 2. Testing Asynchronous Code

Jest provides several ways to handle code that doesn't run synchronously.

### Example 2.1: Promises (Return the promise)

The simplest way is to return the promise from your test. Jest will wait for it to resolve or reject.

```
// Function to be tested
function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('peanut butter'), 100);
  });
}

describe('fetchData with Promises', () => {
  it('should resolve to "peanut butter"', () => {
    // IMPORTANT: Return the promise!
    return fetchData().then((data) => {
      expect(data).toBe('peanut butter');
    });
  });
});
```

### Example 2.2: `async/await` (Preferred)

This is the modern and most readable way to test async code.

```
// Function to be tested
async function fetchAsyncData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('peanut butter'), 100);
  });
}

describe('fetchAsyncData with async/await', () => {
  // Use the `async` keyword on the test function
  it('should resolve to "peanut butter"', async () => {
    // Use `await` to get the result
    const data = await fetchAsyncData();
    expect(data).toBe('peanut butter');
  });
});
```

### Example 2.3: `.resolves` and `.rejects` Matchers

Jest has special matchers that simplify async assertions.

```
async function fetchSuccess() {
  return 'success';
}
async function fetchFailure() {
  throw new Error('failed');
}

describe('.resolves and .rejects', () => {
  it('should resolve correctly', async () => {
    // Jest waits for the promise and checks its resolved value
    await expect(fetchSuccess()).resolves.toBe('success');
  });

  it('should reject correctly', async () => {
    // Jest waits for the promise and checks its rejection reason
    await expect(fetchFailure()).rejects.toThrow('failed');
  });
});
```

## 3. Setup & Teardown

Sometimes you need to perform setup before tests run or cleanup after they finish.

- `beforeEach(fn)`: Runs before _each_ test in the `describe` block.
    
- `afterEach(fn)`: Runs after _each_ test in the `describe` block.
    
- `beforeAll(fn)`: Runs _once_ before all tests in the block.
    
- `afterAll(fn)`: Runs _once_ after all tests in the block.
    

```
let database;

function initializeDatabase() {
  database = { users: ['Alice', 'Bob'] };
}

function clearDatabase() {
  database = null;
}

describe('Database operations', () => {
  // Run once before all tests
  beforeAll(() => {
    console.log('Connecting to database...');
  });

  // Run before each individual test
  beforeEach(() => {
    initializeDatabase();
  });

  // Run after each individual test
  afterEach(() => {
    clearDatabase();
  });

  // Run once after all tests
  afterAll(() => {
    console.log('Disconnecting from database...');
  });

  it('should have 2 users after initialization', () => {
    expect(database.users.length).toBe(2);
  });

  it('should add a user', () => {
    database.users.push('Charlie');
    expect(database.users).toContain('Charlie');
  });
});
```

## 4. Mocking & Spies

Unit tests should be isolated. If a function `A` calls a function `B` (e.g., an API call or database query), you should "mock" function `B` to avoid testing it.

### Example 4.1: Mocking a Function (`jest.fn()`)

This lets you track how a function is called, what it's called with, and what it returns.

```
// Function to test
function forEach(items, callback) {
  for (let index = 0; index < items.length; index++) {
    callback(items[index]);
  }
}

describe('forEach function', () => {
  it('should call the callback for each item', () => {
    // Create a mock function
    const mockCallback = jest.fn();

    forEach([0, 1], mockCallback);

    // Check how many times it was called
    expect(mockCallback.mock.calls.length).toBe(2);

    // Check the arguments of the first call
    expect(mockCallback.mock.calls[0][0]).toBe(0);

    // Check the arguments of the second call
    expect(mockCallback.mock.calls[1][0]).toBe(1);
  });
});
```

### Example 4.2: Mocking a Module

This is extremely useful for replacing external dependencies, like `axios` or a database module.

```
// --- File: api.js ---
// import axios from 'axios';
// export async function fetchUsername(userID) {
//   const response = await axios.get(`https.../users/${userID}`);
//   return response.data.name;
// }

// --- File: api.test.js ---
// import axios from 'axios';
// import { fetchUsername } from './api';

// Tell Jest to replace the 'axios' module with a mock
// jest.mock('axios');

// describe('fetchUsername', () => {
//   it('should return the user name from the API', async () => {
//     // Create a mock response
//     const mockResponse = { data: { name: 'Pikachu' } };

//     // Tell the mocked axios.get to return our mock response
//     axios.get.mockResolvedValue(mockResponse);

//     const name = await fetchUsername(1);

//     // Assert that the function returned the correct data
//     expect(name).toBe('Pikachu');
//     // Assert that axios.get was called with the correct URL
//     expect(axios.get).toHaveBeenCalledWith('https.../users/1');
//   });
// });
```

### Example 4.3: Spying on a Function (`jest.spyOn()`)

Sometimes you just want to know if a function was called without replacing its implementation.

```
const calculator = {
  add: (a, b) => a + b,
  log: (message) => console.log(message),
};

describe('calculator', () => {
  it('should call the log function when adding', () => {
    // Create a "spy" on `calculator.log`
    const logSpy = jest.spyOn(calculator, 'log');

    // Act
    calculator.add(2, 3);
    calculator.log('add called');

    // Assert
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('add called');

    // Restore the original implementation
    logSpy.mockRestore();
  });
});
```

### Example 4.4: Mocking Timers (`jest.useFakeTimers()`)

This allows you to control time-based functions like `setTimeout` or `setInterval`.

```
// Function to test
function delayedMessage(callback) {
  setTimeout(() => {
    callback('Hello');
  }, 1000);
}

// Tell Jest to use fake timers
jest.useFakeTimers();

describe('delayedMessage', () => {
  it('should call the callback after 1 second', () => {
    const mockCallback = jest.fn();

    delayedMessage(mockCallback);

    // At this point, the callback has NOT been called
    expect(mockCallback).not.toHaveBeenCalled();

    // Fast-forward time by 1000ms
    jest.advanceTimersByTime(1000);

    // Now, the callback should have been called
    expect(mockCallback).toHaveBeenCalledWith('Hello');
  });
});
```

## 5. Parameterized Tests (`test.each`)

If you need to run the same test logic with many different inputs, `test.each` keeps your code DRY (Don't Repeat Yourself).

```
// Function to be tested
function add(a, b) {
  return a + b;
}

describe('add function with test.each', () => {
  // Define the test data as an array of arrays
  // [a, b, expected]
  test.each([
    [1, 1, 2],
    [1, 2, 3],
    [5, 5, 10],
    [-1, 1, 0],
  ])(
    // The test name can use placeholders like %s (string) or %i (integer)
    'add(%i, %i) should return %i',
    (a, b, expected) => {
      // The test logic is run for each row of data
      expect(add(a, b)).toBe(expected);
    }
  );
});
```