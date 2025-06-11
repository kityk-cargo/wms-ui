import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

/**
 * Integration tests for Mock Server Provider State Management
 *
 * These tests verify that the mock server correctly handles provider states
 * as defined in the Pact contracts, ensuring different states return appropriate responses.
 */

describe('Mock Server Provider State Management', () => {
  let mockServerProcess: ChildProcess;
  const mockServerPort = 30090;
  const baseUrl = `http://localhost:${mockServerPort}`;

  beforeAll(async () => {
    // Start the mock server
    const mockServerPath = path.resolve(process.cwd(), 'mock-server.js');
    mockServerProcess = spawn('node', [mockServerPath], {
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Mock server failed to start within 10 seconds'));
      }, 10000);

      mockServerProcess.stdout?.on('data', (data) => {
        if (data.toString().includes('Mock server running')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      mockServerProcess.stderr?.on('data', (data) => {
        console.error('Mock server error:', data.toString());
      });
    });
  });

  afterAll(() => {
    if (mockServerProcess) {
      mockServerProcess.kill();
    }
  });

  async function makeRequest(path: string, options: RequestInit = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    return {
      status: response.status,
      data: response.headers.get('content-type')?.includes('json')
        ? await response.json()
        : await response.text(),
    };
  }

  async function setState(state: string, path?: string) {
    const body = path ? { state, path } : { state };
    return makeRequest('/api/mock-server/state', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async function resetStates() {
    return makeRequest('/api/mock-server/reset', { method: 'POST' });
  }

  it('should start with default behavior (200 status preferred)', async () => {
    await resetStates();
    const response = await makeRequest('/api/v1/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should set valid provider states successfully', async () => {
    const response = await setState('orders exist');
    expect(response.status).toBe(200);
    expect(response.data.message).toContain('successfully');
    expect(response.data.validStates).toContain('orders exist');
  });

  it('should return different responses based on provider state', async () => {
    // Test error state
    await setState('product service is experiencing issues');
    const errorResponse = await makeRequest('/api/v1/products/1');
    expect(errorResponse.status).toBe(500);
    expect(errorResponse.data.criticality).toBe('critical');

    // Test success state
    await setState('product with ID 1 exists');
    const successResponse = await makeRequest('/api/v1/products/1');
    expect(successResponse.status).toBe(200);
    expect(successResponse.data.id).toBe(1);
  });

  it('should handle invalid states with warnings', async () => {
    const response = await setState('nonexistent state');
    expect(response.status).toBe(200);
    expect(response.data.warnings).toContain(
      'nonexistent state not found in contracts',
    );
    expect(response.data.availableStates).toBeDefined();
  });

  it('should reset states to default behavior', async () => {
    await setState('orders exist');
    const resetResponse = await resetStates();
    expect(resetResponse.status).toBe(200);
    expect(resetResponse.data.message).toContain('reset');
  });

  it('should handle multiple states', async () => {
    const response = await makeRequest('/api/mock-server/state', {
      method: 'POST',
      body: JSON.stringify({ states: ['orders exist', 'products exist'] }),
    });
    expect(response.status).toBe(200);
    expect(response.data.validStates).toHaveLength(2);
  });

  it('should accept path scoping parameter', async () => {
    const response = await setState('orders exist', '/api/v1/orders');
    expect(response.status).toBe(200);
    expect(response.data.message).toContain('successfully');
  });

  it('should return 400 for invalid request format', async () => {
    const response = await makeRequest('/api/mock-server/state', {
      method: 'POST',
      body: JSON.stringify({ invalidField: 'test' }),
    });
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('Invalid request format');
  });
});
