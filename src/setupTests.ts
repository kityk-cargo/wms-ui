// This file contains any setup needed for testing with Vitest
// You can add any global setup code here, such as custom matchers or global mocks

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Run cleanup after each test
afterEach(() => {
  cleanup();
});

// You can add global test utilities here
