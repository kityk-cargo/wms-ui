# Simple Mock Server Seeded from Pact Contracts

This project includes a simple standalone mock server that serves API responses based on your Pact contracts.

## How It Works

1. The mock server reads all Pact contract files from the `pacts/` directory
2. It creates routes for every interaction defined in those contracts
3. When you make a request to the mock server, it returns the exact response defined in the Pact contract

## Running the Mock Server

```bash
npm run mock-server
```

The server starts on port 30080 by default (matching your regular API endpoint). 

## Configuration

You can configure the mock server using environment variables:

1. Create a `.env` file in the project root (you can copy from `.env.mock-server.example`)
2. Set the following variables:
   ```
   # Port to run the mock server on
   MOCK_SERVER_PORT=30080
   ```

Alternatively, you can set the port using the command line:

```bash
MOCK_SERVER_PORT=3030 npm run mock-server
```

## Using with Your Application

No code changes are needed in your application. Simply:

1. Start the mock server
2. Run your application as normal
3. Your API requests will be answered by the mock server with data from the Pact contracts

## Adding New Mock Endpoints

To add more endpoints to the mock server:

1. Create a new Pact test that defines the interaction
2. Run `npm run test:pact` to generate the Pact contract
3. Restart the mock server to pick up the new interaction

## Troubleshooting

If you encounter issues:

- Check the console output of the mock server to see available routes
- Ensure the request path and method match exactly what's in the Pact contract
- Verify that the Pact contracts have been generated correctly

## Technical Notes

- The mock server is implemented in `mock-server.cjs` as a CommonJS module
- It uses the standard Node.js http module
- Environment variables can be configured through a `.env` file
- All data comes directly from your Pact contract files

## Advantages

- **Zero Code Changes**: No changes to your application code
- **Single Source of Truth**: Uses the same Pact contracts used for testing
- **Independent Development**: Develop frontend features without waiting for backend implementation 