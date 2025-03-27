# Contract Testing with Pact

This project uses [Pact](https://pact.io/) for consumer-driven contract testing between the UI (consumer) and the backend API services (providers).

## What is Contract Testing?

Contract testing is a methodology for ensuring that two separate systems (such as a client and a server) can communicate with each other. It captures the interactions between these systems, stores them in a contract file, and verifies that both sides adhere to this contract.

## How Pact Works

1. **Consumer Tests**: The UI (consumer) defines expected interactions with the API (provider) in terms of requests and responses.
2. **Contract Generation**: Running the consumer tests generates a Pact contract file.
3. **Provider Verification**: The API service (provider) verifies that it can fulfill the expectations in the Pact contract.

## Project Setup

### Dependencies

The project uses the following Pact-related dependencies:
- `@pact-foundation/pact`: Core library for Pact testing
- `@pact-foundation/pact-node`: Node.js wrapper for the Pact CLI

### Installation

If not already installed, you can add the Pact dependencies:

```bash
npm install --save-dev @pact-foundation/pact @pact-foundation/pact-node
```

## Running the Tests

### Consumer Tests

To run the Pact consumer tests:

```bash
npm run test:pact
```

This will:
1. Start a mock Pact server
2. Run the consumer tests against this mock server
3. Generate a Pact contract file in the `./pacts` directory

### Publishing Pacts

To publish the Pact contracts to a Pact Broker:

1. Configure your Pact Broker URL and token in `package.json`
2. Run:

```bash
npm run pact:publish
```

### Verifying Deployment

To check if the consumer version is compatible with all its providers:

```bash
npm run pact:can-deploy
```

## Consumer Tests Structure

The consumer tests are located in `src/services/pact/` and include:

1. **Basic Contract Tests** (`product.pact.spec.ts`):
   - Define exact expected responses
   - Verify the structure and values match exactly

2. **Schema Contract Tests** (`product.pact.matcher.spec.ts`):
   - Use Pact matchers to define the expected schema
   - More flexible, focusing on types and patterns rather than exact values

## Provider Verification

For the backend API services (providers), you'll need to implement provider verification tests. These will:

1. Start the API service
2. Use the Pact contract file from the consumer
3. Verify that the API can fulfill all the interactions defined in the contract

## Best Practices

1. **Keep Contracts Minimal**: Only include the fields and behaviors you actually use
2. **Use Pact Matchers**: Prefer type-based matching instead of exact values when possible
3. **Maintain Provider States**: Ensure your provider tests can set up the correct state for each interaction
4. **Version Your Contracts**: Consider your consumer and provider versions carefully
5. **Integrate with CI/CD**: Run contract tests as part of your pipeline

## Example Workflow

1. UI team defines expected API responses in Pact consumer tests
2. Consumer tests generate a Pact contract file
3. Contract is published to a Pact Broker
4. API team runs provider verification against this contract
5. If verification fails, teams collaborate to resolve the discrepancy
6. Once verified, both services can be deployed with confidence 