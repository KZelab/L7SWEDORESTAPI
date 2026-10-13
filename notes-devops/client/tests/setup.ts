import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Remove whatever the previous test rendered, so tests cannot affect each other.
afterEach(() => {
  cleanup();
});
