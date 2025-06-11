import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Unit tests for Mock Server Provider State Management
 *
 * These tests verify the provider state management logic directly
 * without requiring an external server to be running.
 */

// Type definitions for the mock
interface RouteConfig {
  status: number;
  body: any;
}

interface StateRouteOption {
  routeConfig: RouteConfig;
  states: string[];
}

interface SetStatesResult {
  warnings: string[];
  validStates: string[];
  availableStates: string[];
}

// Mock ProviderStateManager (simplified version for testing)
const createProviderStateManager = () => ({
  currentStates: [] as string[],
  currentPath: null as string | null,
  availableStates: new Set([
    'orders exist',
    'products exist',
    'product with ID 1 exists',
    'product service is experiencing issues',
  ]),
  stateRoutes: new Map<string, StateRouteOption[]>([
    [
      'GET:/api/v1/orders',
      [
        { routeConfig: { status: 200, body: [] }, states: [] },
        {
          routeConfig: { status: 200, body: [{ id: 1, status: 'pending' }] },
          states: ['orders exist'],
        },
      ],
    ],
    [
      'GET:/api/v1/products/1',
      [
        {
          routeConfig: { status: 404, body: { error: 'Not found' } },
          states: [],
        },
        {
          routeConfig: { status: 200, body: { id: 1, name: 'Product 1' } },
          states: ['product with ID 1 exists'],
        },
        {
          routeConfig: { status: 500, body: { criticality: 'critical' } },
          states: ['product service is experiencing issues'],
        },
      ],
    ],
  ]),

  setStates(states: string[], path: string | null = null): SetStatesResult {
    const warnings: string[] = [];
    const validStates = states.filter((state: string) => {
      if (this.availableStates.has(state)) {
        return true;
      } else {
        warnings.push(`${state} not found in contracts`);
        return false;
      }
    });

    this.currentStates = validStates;
    this.currentPath = path;

    return {
      warnings,
      validStates,
      availableStates: Array.from(this.availableStates),
    };
  },

  reset(): void {
    this.currentStates = [];
    this.currentPath = null;
  },

  getAvailableStates(): string[] {
    return Array.from(this.availableStates);
  },

  getMatchingRoute(routeKey: string): RouteConfig | null {
    const options = this.stateRoutes.get(routeKey);
    if (!options?.length) return null;

    // If current states are set, try to match them (ANY logic)
    if (this.currentStates.length > 0) {
      // If path scoping is active, check if this route matches the scoped path
      if (this.currentPath) {
        const [, routePath] = routeKey.split(':');
        if (!routePath.startsWith(this.currentPath)) {
          // Route doesn't match scoped path, skip state-based matching
          return this._getDefaultRoute(options);
        }
      }

      // Find route that matches any of the current states
      for (const currentState of this.currentStates) {
        const match = options.find((option: StateRouteOption) =>
          option.states.includes(currentState),
        );
        if (match) return match.routeConfig;
      }
    }

    return this._getDefaultRoute(options);
  },

  _getDefaultRoute(options: StateRouteOption[]): RouteConfig {
    // Default behavior: prefer no provider state, then 2xx status codes
    const noStateOptions = options.filter(
      (option: StateRouteOption) => option.states.length === 0,
    );
    if (noStateOptions.length > 0) {
      const twoxxOption = noStateOptions.find(
        (option: StateRouteOption) =>
          option.routeConfig.status >= 200 && option.routeConfig.status < 300,
      );
      return twoxxOption
        ? twoxxOption.routeConfig
        : noStateOptions[0].routeConfig;
    }

    // If no no-state options, pick first 2xx from any option
    const twoxxOption = options.find(
      (option: StateRouteOption) =>
        option.routeConfig.status >= 200 && option.routeConfig.status < 300,
    );

    return twoxxOption ? twoxxOption.routeConfig : options[0].routeConfig;
  },
});

describe('Mock Server Provider State Management', () => {
  let stateManager: ReturnType<typeof createProviderStateManager>;

  beforeEach(() => {
    stateManager = createProviderStateManager();
  });

  it('should start with default behavior (200 status preferred)', () => {
    // Arrange
    stateManager.reset();

    // Act
    const route = stateManager.getMatchingRoute('GET:/api/v1/orders');

    // Assert
    expect(route?.status).toBe(200);
    expect(Array.isArray(route?.body)).toBe(true);
    expect(route?.body).toHaveLength(0); // Empty array for default state
  });

  it('should set valid provider states successfully', () => {
    // Arrange & Act
    const result = stateManager.setStates(['orders exist']);

    // Assert
    expect(result.warnings).toHaveLength(0);
    expect(result.validStates).toContain('orders exist');
    expect(result.validStates).toHaveLength(1);
  });

  it('should return different responses based on provider state', () => {
    // Arrange & Act - Test error state
    stateManager.setStates(['product service is experiencing issues']);
    const errorResponse = stateManager.getMatchingRoute(
      'GET:/api/v1/products/1',
    );

    // Assert
    expect(errorResponse?.status).toBe(500);
    expect(errorResponse?.body.criticality).toBe('critical');

    // Arrange & Act - Test success state
    stateManager.setStates(['product with ID 1 exists']);
    const successResponse = stateManager.getMatchingRoute(
      'GET:/api/v1/products/1',
    );

    // Assert
    expect(successResponse?.status).toBe(200);
    expect(successResponse?.body.id).toBe(1);
  });

  it('should handle invalid states with warnings', () => {
    // Arrange & Act
    const result = stateManager.setStates(['nonexistent state']);

    // Assert
    expect(result.warnings).toContain(
      'nonexistent state not found in contracts',
    );
    expect(result.availableStates).toBeDefined();
    expect(result.validStates).toHaveLength(0);
  });

  it('should reset states to default behavior', () => {
    // Arrange
    stateManager.setStates(['orders exist']);

    // Act
    stateManager.reset();

    // Assert
    expect(stateManager.currentStates).toHaveLength(0);
    expect(stateManager.currentPath).toBeNull();

    // Verify default behavior is restored
    const route = stateManager.getMatchingRoute('GET:/api/v1/orders');
    expect(route?.body).toHaveLength(0); // Empty array for default
  });

  it('should handle multiple states', () => {
    // Arrange & Act
    const result = stateManager.setStates(['orders exist', 'products exist']);

    // Assert
    expect(result.validStates).toHaveLength(2);
    expect(result.validStates).toContain('orders exist');
    expect(result.validStates).toContain('products exist');
  });

  it('should accept path scoping parameter', () => {
    // Arrange & Act
    const result = stateManager.setStates(['orders exist'], '/api/v1/orders');

    // Assert
    expect(result.warnings).toHaveLength(0);
    expect(result.validStates).toContain('orders exist');
    expect(stateManager.currentPath).toBe('/api/v1/orders');
  });

  it('should enforce path scoping when set', () => {
    // Arrange - Set state scoped to products path
    stateManager.setStates(
      ['product service is experiencing issues'],
      '/api/v1/products',
    );

    // Act & Assert - Product route should use the error state
    const productRoute = stateManager.getMatchingRoute(
      'GET:/api/v1/products/1',
    );
    expect(productRoute?.status).toBe(500);

    // Act & Assert - Orders route should ignore the state (different path)
    const ordersRoute = stateManager.getMatchingRoute('GET:/api/v1/orders');
    expect(ordersRoute?.status).toBe(200);
    expect(ordersRoute?.body).toHaveLength(0); // Default behavior
  });

  it('should handle mixed valid and invalid states', () => {
    // Arrange & Act
    const result = stateManager.setStates([
      'orders exist',
      'invalid state',
      'products exist',
    ]);

    // Assert
    expect(result.validStates).toHaveLength(2);
    expect(result.validStates).toContain('orders exist');
    expect(result.validStates).toContain('products exist');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain(
      'invalid state not found in contracts',
    );
  });
});
