# Mock Server State Management Requirements

## Overview
Enhance the existing mock server to support Pact provider states while preserving current behavior for backward compatibility.

## Core Requirements

### 1. Preserve Current Behavior
- Existing functionality must remain unchanged when no provider states are explicitly set
- Default route selection should prefer interactions with 200* status codes first
- If no 200* codes found, select first interaction regardless of status
- Current logging and route building behavior should be maintained

### 2. Provider State Support
- Parse `providerState` (string) and `providerStates` (array) fields from Pact contracts
- Support APIs with same URLs/methods but different responses based on provider states
- Handle interactions that have no provider state (current default behavior)

### 3. State Setting API

#### Endpoint: `POST /api/mock-server/state`
**Request Format (JSON only):**
```json
{
  "state": "orders exist",           // Single state
  "path": "/api/v1/orders"          // Optional: limit scope to specific path
}
```

```json
{
  "states": ["orders exist", "products available"],  // Multiple states
  "path": "/api/v1/orders"                          // Optional: limit scope
}
```

**Response Format:**
- **Success (200):** 
  ```json
  {
    "message": "Provider state(s) set successfully",
    "warnings": ["invalid_state not found in contracts"]  // If partial success
  }
  ```

- **Error (400):**
  ```json
  {
    "error": "Invalid provider state(s)",
    "availableStates": ["orders exist", "no orders", "products available"]
  }
  ```

### 4. State Reset API

#### Endpoint: `POST /api/mock-server/reset`
**Request:** Empty body

**Response:**
```json
{
  "message": "Provider states reset to default behavior"
}
```

### 5. State Matching Logic

#### Default Behavior (No State Set)
1. First, find interactions with no `providerState`/`providerStates` field
2. If none found, pick first interaction with 2xx status code
3. If none found, pick first interaction regardless of status

#### State-Based Matching
- **Single State:** Match interactions containing the specified state
- **Multiple States:** Match interactions containing ANY of the specified states
- **Priority:** First state in array has priority in case of conflicts
- **Path Scope:** When `path` is specified, only affect routes matching that path

### 6. State Validation
- Validate provider states exist in loaded contracts at state-setting time
- Return 400 error immediately if invalid states are specified
- For multiple states: continue with valid ones, warn about invalid ones

### 7. State Persistence
- Provider states persist until explicitly changed via API
- No automatic reset after requests
- No timeout mechanism
- States survive until server restart or explicit reset

### 8. Error Handling
- **Unknown States:** 400 status with JSON error and available states list
- **Partial Success:** 200 status with warnings in response body
- **Complete Failure:** 400 status with detailed error information

### 9. Startup Help Display
Display minimalistic but informative help on server startup:

```
Provider State Management:
- Set state: POST /api/mock-server/state {"state": "state_name"}
- Set multiple: POST /api/mock-server/state {"states": ["state1", "state2"]}  
- Limit scope: POST /api/mock-server/state {"state": "state_name", "path": "/api/path"}
- Reset states: POST /api/mock-server/reset
```

## Technical Implementation Notes

### Route Building Enhancement
- Extend current route building to track provider states per interaction
- Maintain backward compatibility with existing route structure
- Add state-aware route matching logic

### State Storage
- Maintain current active provider states in memory
- Track which paths are affected by state changes
- Store mapping of states to available interactions

### Request Handling Enhancement
- Modify existing request handler to check current provider states
- Implement fallback logic for state-based route matching
- Preserve current CORS and OPTIONS handling

### Contract Processing
- Parse both `providerState` (string) and `providerStates` (array of objects with `name` field)
- Extract and catalog all available provider states during contract loading
- Build state-to-interaction mappings for efficient lookup

## Backward Compatibility
- All existing functionality must work unchanged
- No breaking changes to current API endpoints
- Existing route behavior preserved when no states are set
- Current logging and error handling maintained
