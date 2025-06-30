# Contract Testing with Pact

Consumer-driven contract testing between the UI and backend services (wms-inventory-management, wms-order-management).

## WMS-Specific Setup

### Provider Verification

Each provider service needs to implement verification tests against its respective contract file in `pacts/`. Provider services should handle their specific business operations and error scenarios as defined in the contracts.

### Pact Broker Integration

Configure Pact Broker URL and token in `package.json` for contract publishing and deployment verification.

### Testing Strategy

- **Error Contracts**: Validate error handling across service boundaries
- **Matcher Contracts**: Schema validation for evolving APIs  
- **Operations Contracts**: Core business logic interactions 