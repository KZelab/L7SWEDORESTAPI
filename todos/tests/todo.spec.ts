import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the todo app', async ({ page }) => {
    await expect(page.getByText('Add New Todo')).toBeVisible();
    await expect(page.getByText('Your Todos')).toBeVisible();
  });


  test('should create a new todo', async ({ page }) => {
    const todoTitle = 'Test Todo ' + Date.now();
    const todoDescription = 'Test description ' + Date.now();

    await page.getByPlaceholder('Todo title').fill(todoTitle);
    await page.getByPlaceholder('Description').fill(todoDescription);
    await page.getByRole('button', { name: 'Add Todo' }).click();

    // Wait for success toast
    await expect(page.getByText('Todo created successfully').first()).toBeVisible();

    // Verify todo appears in the list
    await expect(page.getByText(todoTitle)).toBeVisible();
    await expect(page.getByText(todoDescription)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without title
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await expect(page.getByText('Title is required')).toBeVisible();

    // Fill title but not description
    await page.getByPlaceholder('Todo title').fill('Test Title');
    await page.getByRole('button', { name: 'Add Todo' }).click();
    await expect(page.getByText('Description is required')).toBeVisible();
  });

  test('should toggle todo completion', async ({ page }) => {
    // Create a todo first
    const todoTitle = 'Toggle Test ' + Date.now();
    const todoDescription = 'Test description ' + Date.now();

    await page.getByPlaceholder('Todo title').fill(todoTitle);
    await page.getByPlaceholder('Description').fill(todoDescription);
    await page.getByRole('button', { name: 'Add Todo' }).click();

    await expect(page.getByText('Todo created successfully').first()).toBeVisible();

    // Wait for toast to disappear
    await page.waitForTimeout(2000);

    // Target the specific Card component using its hover:shadow-md class
    const todoCard = page.locator('[class*="hover:shadow-md"]').filter({
      has: page.getByRole('heading', { name: todoTitle, exact: true })
    });

    const checkbox = todoCard.getByRole('checkbox');
    await checkbox.click();
    await expect(page.getByText('Todo updated').first()).toBeVisible();

    // Verify completed state
    const titleElement = todoCard.getByRole('heading', { name: todoTitle });
    await expect(titleElement).toHaveClass(/line-through/);

    // Toggle back
    await checkbox.click();
    await expect(page.getByText('Todo updated').first()).toBeVisible();
  });

  test('should delete a todo', async ({ page }) => {
    // Create a todo first
    const todoTitle = 'Delete Test ' + Date.now();
    const todoDescription = 'Will be deleted ' + Date.now();

    await page.getByPlaceholder('Todo title').fill(todoTitle);
    await page.getByPlaceholder('Description').fill(todoDescription);
    await page.getByRole('button', { name: 'Add Todo' }).click();

    await expect(page.getByText('Todo created successfully').first()).toBeVisible();

    // Wait for toast to disappear
    await page.waitForTimeout(2000);

    // Target the specific Card component using its hover:shadow-md class
    const todoCard = page.locator('[class*="hover:shadow-md"]').filter({
      has: page.getByRole('heading', { name: todoTitle, exact: true })
    });
    await todoCard.getByRole('button').click();

    // Verify deletion
    await expect(page.getByText('Todo deleted').first()).toBeVisible();
    await expect(page.getByText(todoTitle)).not.toBeVisible();
  });

  test('should clear form after successful submission', async ({ page }) => {
    const todoTitle = 'Form Clear Test ' + Date.now();
    const todoDescription = 'Test clearing form ' + Date.now();

    const titleInput = page.getByPlaceholder('Todo title');
    const descriptionInput = page.getByPlaceholder('Description');

    await titleInput.fill(todoTitle);
    await descriptionInput.fill(todoDescription);
    await page.getByRole('button', { name: 'Add Todo' }).click();

    await expect(page.getByText('Todo created successfully').first()).toBeVisible();

    // Verify inputs are cleared
    await expect(titleInput).toHaveValue('');
    await expect(descriptionInput).toHaveValue('');
  });

  test('should handle multiple todos', async ({ page }) => {
    const timestamp = Date.now();
    const todos = [
      { title: `First Todo ${timestamp}`, description: `First description ${timestamp}` },
      { title: `Second Todo ${timestamp}`, description: `Second description ${timestamp}` },
      { title: `Third Todo ${timestamp}`, description: `Third description ${timestamp}` },
    ];

    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i];
      await page.getByPlaceholder('Todo title').fill(todo.title);
      await page.getByPlaceholder('Description').fill(todo.description);
      await page.getByRole('button', { name: 'Add Todo' }).click();

      // Use .first() to avoid strict mode violation when multiple toasts appear
      await expect(page.getByText('Todo created successfully').first()).toBeVisible();

      // Verify this todo appears immediately
      await expect(page.getByText(todo.title)).toBeVisible();

      // Wait for toast to disappear before creating next todo
      await page.waitForTimeout(2000);
    }

  });
});

// Run delete all test serially to avoid conflicts with parallel tests
test.describe.serial('Todo App - Delete All', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should delete all todos', async ({ page }) => {
    // Create a few todos first
    const timestamp = Date.now();
    const todos = [
      { title: `Cleanup Todo 1 ${timestamp}`, description: `Description 1 ${timestamp}` },
      { title: `Cleanup Todo 2 ${timestamp}`, description: `Description 2 ${timestamp}` },
    ];

    for (const todo of todos) {
      await page.getByPlaceholder('Todo title').fill(todo.title);
      await page.getByPlaceholder('Description').fill(todo.description);
      await page.getByRole('button', { name: 'Add Todo' }).click();
      await expect(page.getByText('Todo created successfully').first()).toBeVisible();
      await page.waitForTimeout(1500);
    }

    // Verify Delete All button is visible
    const deleteAllButton = page.getByRole('button', { name: 'Delete All' });
    await expect(deleteAllButton).toBeVisible();

    // Click Delete All
    await deleteAllButton.click();

    // Verify success message
    await expect(page.getByText('All todos deleted').first()).toBeVisible();

    // Verify empty state is shown
    await expect(page.getByText('No todos yet. Create one above!')).toBeVisible();

    // Verify Delete All button is no longer visible
    await expect(deleteAllButton).not.toBeVisible();
  });
});
