Building a reliable and maintainable Express API in TypeScript requires a solid testing strategy. Automated tests are your safety net: they give you the confidence to refactor code, add new features, and ensure your API behaves exactly as you expect.

This guide will walk you through the "why," "what," and "how" of testing your TypeScript Express application, from individual functions up to full end-to-end (E2E) flows.

## The Testing Pyramid

We'll structure our strategy around the testing pyramid. For a REST API, this translates to:

- **Unit Tests (Fast & Many):** Test small, isolated pieces of logic (e.g., a single service function, a utility). They are fast and cheap to write.
    
- **Integration Tests (Slower & Fewer):** Test how different parts of your system work together. For us, this is the sweet spot: testing a controller, its service, and its middleware _together_, but mocking external dependencies like databases.
    
- **End-to-End (E2E) Tests (Slowest & Rarest):** Test the entire, running application. This involves spinning up your server, connecting to a _real_ test database, and making actual HTTP requests to `http://localhost:port`.
    

## Recommended Toolset

- **Test Runner:** [**Jest**](https://jestjs.io/ "null") - A comprehensive testing framework. It includes a test runner, assertion library (`expect`), and powerful mocking capabilities right out of the box.
    
- **TypeScript Support:** [**ts-jest**](https://kulshekhar.github.io/ts-jest/ "null") - A Jest transformer that makes working with TypeScript seamless.
    
- **HTTP Requests:** [**Supertest**](https://github.com/visionmedia/supertest "null") - The gold standard for testing Express apps. It lets you make requests against your `app` object directly without needing to manually manage ports, making integration tests fast and easy.
    
- **Database Management:** Use a separate test database. You can automate its creation and teardown using Docker and `docker-compose`.
    

### Initial Setup

1. **Install dev dependencies:**
    
    ```
    npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
    ```
    
2. Configure Jest:
    
    Create a jest.config.js file in your root directory:
    
    ```
    // jest.config.js
    module.exports = {
      preset: 'ts-jest',
      testEnvironment: 'node',
      // Automatically clear mock calls and instances between every test
      clearMocks: true,
      // The directory where Jest should output its coverage files
      coverageDirectory: 'coverage',
      // An array of file extensions your modules use
      moduleFileExtensions: ['js', 'ts', 'json', 'node'],
      // A list of paths to directories that Jest should use to search for files in
      roots: ['<rootDir>/src'],
      // The test match patterns
      testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    };
    ```
    
3. **Add `package.json` scripts:**
    
    ```
    "scripts": {
      "test": "jest",
      "test:watch": "jest --watch",
      "test:cov": "jest --coverage"
    }
    ```
    

## 1. Unit Tests (The Base)

**Goal:** Test a single function or class in complete isolation.

Let's say you have a simple utility function.

```
// src/utils/validators.ts
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
```

Your test would live in `src/utils/validators.test.ts`:

```
// src/utils/validators.test.ts
import { isValidEmail } from './validators';

describe('isValidEmail', () => {
  // Use 'it' or 'test'
  it('should return true for a valid email', () => {
    // Arrange, Act, Assert (AAA Pattern)
    const email = 'test@example.com';
    const result = isValidEmail(email);
    expect(result).toBe(true);
  });

  it('should return false for an invalid email', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});
```

**Key Idea:** No Express, no database, just pure TypeScript logic.

## 2. Integration Tests (The Sweet Spot)

**Goal:** Test a controller, its services, and middleware _without_ the database. We use `supertest` to simulate HTTP requests against the `app` object and mock the service layer.

This gives us high confidence that our routing, request validation, and business logic are wired correctly.

### Decouple Your Server

First, **it's crucial to export your `app` object** _**without**_ **starting the server**. This allows Supertest to spin it up on its own.

```
// src/app.ts
import express from 'express';
import { userRouter } from './routes/userRoutes';

const app = express();
app.use(express.json());

app.use('/api/users', userRouter);

export { app }; // Export app

// ---
// src/server.ts
import { app } from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Example: Testing a `POST /users` Route

Let's imagine this controller and service:

```
// src/services/userService.ts
// (Imagine a database model is injected or imported here)
export const userService = {
  createUser: async (email: string, name: string): Promise<{ id: string; email: string; name: string }> => {
    // ... logic to interact with database ...
    console.log(`Creating user in DB: ${name}`);
    // This is what we will mock
    throw new Error('This should be mocked!');
  },
};

// src/controllers/userController.ts
import { Request, Response } from 'express';
import { userService } from '../services/userService';

export const createUserController = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: 'Missing email or name' });
    }
    const user = await userService.createUser(email, name);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
```

Now, let's write the integration test. We will **mock the `userService`**.

```
// src/controllers/userController.test.ts
import request from 'supertest';
import { app } from '../app'; // Our decoupled express app
import { userService } from '../services/userService';

// Mock the userService.createUser function
// We use jest.spyOn to replace the implementation
const createUserSpy = jest.spyOn(userService, 'createUser');

describe('POST /api/users', () => {
  it('should create a new user and return 201', async () => {
    // Arrange
    const userData = { email: 'test@example.com', name: 'Test User' };
    const mockUser = { id: '1', ...userData };
    
    // Tell the mock what to return when called
    createUserSpy.mockResolvedValue(mockUser);

    // Act
    const response = await request(app)
      .post('/api/users')
      .send(userData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockUser);
    expect(createUserSpy).toHaveBeenCalledWith(userData.email, userData.name);
  });

  it('should return 400 if email is missing', async () => {
    // Act
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test User' });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing email or name');
    expect(createUserSpy).not.toHaveBeenCalled();
  });

  it('should return 500 if the service throws an error', async () => {
    // Arrange
    const errorMessage = 'Database failed';
    createUserSpy.mockRejectedValue(new Error(errorMessage));

    // Act
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' });

    // Assert
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error');
  });
});
```

## 3. End-to-End (E2E) Tests (The Peak)

**Goal:** Test the _entire, deployed_ application, including the database.

This is the only way to be 100% sure your application works.

### Test Database Strategy

You **must** use a separate database for E2E tests.

1. **Spin it up:** Use `docker-compose` to start a PostgreSQL or MongoDB container.
    
2. **Run Migrations:** Your test script should run any database migrations before tests start.
    
3. **Clean Up:** **You must clean the database between** _**every**_ **test** to prevent tests from new-polluting each other.
    

```
// e.g., in a test setup file: jest.setup.ts
import { dbClient } from '../src/database'; // Your db client

// Run before all tests
beforeAll(async () => {
  await dbClient.connect(process.env.TEST_DATABASE_URL);
  await dbClient.runMigrations(); // Or whatever your migration command is
});

// Run before each test
beforeEach(async () => {
  // This is the crucial part
  await dbClient.query('TRUNCATE TABLE users, posts, comments RESTART IDENTITY CASCADE');
  // For MongoDB, you might drop collections
  // await dbClient.collection('users').deleteMany({});
});

// Run after all tests
afterAll(async () => {
  await dbClient.disconnect();
});
```

### E2E Test Example

The test looks similar to the integration test, but we target a _running server_ and we **do not mock anything**.

```
// tests/e2e/user-flow.e2e.test.ts
import request from 'supertest';
import { dbClient } from '../../src/database'; // Adjust path

// We test against the real, running server
const API_URL = 'http://localhost:3001'; // Assuming test server runs on 3001

describe('User E2E Flow', () => {

  it('should create a user, then be able to fetch that user', async () => {
    const userData = { email: 'e2e@example.com', name: 'E2E User' };

    // 1. Create the user (POST)
    const createResponse = await request(API_URL)
      .post('/api/users')
      .send(userData);

    expect(createResponse.status).toBe(201);
    const newUserId = createResponse.body.id;
    expect(newUserId).toBeDefined();

    // 2. Verify it's in the database (Optional but good)
    const dbUser = await dbClient.query('SELECT * FROM users WHERE id = $1', [newUserId]);
    expect(dbUser.rows[0].email).toBe(userData.email);

    // 3. Fetch the user (GET)
    // (Assuming you have a GET /api/users/:id route)
    const getResponse = await request(API_URL)
      .get(`/api/users/${newUserId}`);
      
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: newUserId,
      email: userData.email,
      name: userData.name,
    });
  });
});
```

To run this, you'd have a separate script:

```
"scripts": {
  "test:e2e": "NODE_ENV=test npm run start:server && jest --config jest.e2e.config.js"
}
```

## Best Practices & Summary

1. **Write Tests First (TDD):** For new features, try writing the failing test first, then write the code to make it pass.
    
2. **Focus on Integration:** For most Express APIs, integration tests (with a mocked DB) provide the best return on investment. They are fast and test your core business logic.
    
3. **Use E2E for Critical Paths:** Reserve slow E2E tests for your most critical user flows (e.g., "sign up," "checkout," "post comment").
    
4. **AAA Pattern:** Structure every test with **Arrange** (set up), **Act** (execute), **Assert** (check the result).
    
5. **CI/CD:** Run your full test suite (unit + integration) in a CI/CD pipeline (like GitHub Actions) on every push. Run E2E tests before deploying to production.
    
6. **Code Coverage:** Use `jest --coverage` to see how much of your code is tested. Aim for high coverage (e.g., >80%), but don't treat it as a golden rule. 100% coverage doesn't mean your app is bug-free.
    

Start small, focus on your integration tests, and build out your test suite as your application grows. Happy testing!