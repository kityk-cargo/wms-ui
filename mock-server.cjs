/**
 * Simple mock server seeded from Pact contracts
 * 
 * Usage:
 * 1. Run: node mock-server.cjs
 * 2. Server starts on port 30080 by default (can be changed in .env file)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Configuration
const PORT = process.env.MOCK_SERVER_PORT || 30080;
const PACTS_DIR = path.join(__dirname, 'pacts');

// Show configuration
console.log('Configuration:');
console.log('- Port:', PORT, process.env.MOCK_SERVER_PORT ? '(from .env)' : '(default)');
console.log('- Pacts directory:', PACTS_DIR);

// Load all Pact contracts
function loadPactContracts() {
  const contracts = [];
  const providerDirs = fs.readdirSync(PACTS_DIR);
  
  providerDirs.forEach(providerDir => {
    const providerPath = path.join(PACTS_DIR, providerDir);
    if (fs.statSync(providerPath).isDirectory()) {
      const files = fs.readdirSync(providerPath);
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const contractPath = path.join(providerPath, file);
          const contractContent = fs.readFileSync(contractPath, 'utf8');
          try {
            const contract = JSON.parse(contractContent);
            contracts.push(contract);
            console.log(`Loaded Pact contract: ${providerDir}/${file}`);
          } catch (error) {
            console.error(`Error parsing contract ${contractPath}:`, error);
          }
        }
      });
    }
  });
  
  return contracts;
}

// Build routes from Pact contracts
function buildRoutesFromContracts(contracts) {
  const routes = {};
  
  contracts.forEach(contract => {
    (contract.interactions || []).forEach(interaction => {
      const { request, response } = interaction;
      const method = request.method.toUpperCase();
      const path = request.path;
      
      // Create a route key in format "METHOD:path"
      const routeKey = `${method}:${path}`;
      
      routes[routeKey] = {
        status: response.status || 200,
        headers: response.headers || { 'Content-Type': 'application/json' },
        body: response.body
      };
      
      console.log(`Added route: ${method} ${path}`);
    });
  });
  
  return routes;
}

// Create the server
function createServer(routes) {
  return http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    // Log the request
    console.log(`${req.method} ${req.url}`);
    
    // Create route key
    const routeKey = `${req.method}:${req.url}`;
    
    // Check if route exists
    if (routes[routeKey]) {
      const { status, headers, body } = routes[routeKey];
      
      // Set response headers
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      // Send response
      res.writeHead(status);
      res.end(JSON.stringify(body));
      console.log(`Responded with status ${status} and data from Pact contract`);
    } else {
      // Route not found
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found in Pact contracts' }));
      console.log(`Route not found in Pact contracts: ${routeKey}`);
    }
  });
}

// Main function to start server
function startServer() {
  console.log('Starting mock server seeded from Pact contracts...');
  console.log(`Looking for Pact contracts in: ${PACTS_DIR}`);
  
  const contracts = loadPactContracts();
  console.log(`Loaded ${contracts.length} Pact contracts`);
  
  const routes = buildRoutesFromContracts(contracts);
  console.log(`Created ${Object.keys(routes).length} routes from Pact interactions`);
  
  const server = createServer(routes);
  
  server.listen(PORT, () => {
    console.log(`Mock server running at http://localhost:${PORT}`);
    console.log('Use Ctrl+C to stop the server');
    console.log('-------------------------------------------');
    console.log('Available routes:');
    Object.keys(routes).forEach(route => {
      console.log(`- ${route}`);
    });
  });
}

// Start the server
startServer(); 