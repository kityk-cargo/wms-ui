/**
 * Mock Server for API Testing
 *
 * This server loads Pact contract files and creates API endpoints that respond with
 * data defined in those contracts. It's useful for frontend development without
 * requiring the real backend.
 *
 * Usage:
 * 1. Run: node mock-server.js
 * 2. Server starts on port 30080 by default (can be changed in .env file)
 */

"use strict";

// ============================================================================
// DEPENDENCIES AND CONFIGURATION
// ============================================================================

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Initialize dotenv
dotenv.config();

// Get current __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration constants
const CONFIG = {
  port: process.env.MOCK_SERVER_PORT || 30080,
  pactsDirectory: path.join(__dirname, "pacts"),
  defaultContentType: "application/json",
};

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const Logger = {
  /**
   * Logs server configuration details
   */
  logConfig() {
    console.log("Configuration:");
    console.log(
      "- Port:",
      CONFIG.port,
      process.env.MOCK_SERVER_PORT ? "(from .env)" : "(default)",
    );
    console.log("- Pacts directory:", CONFIG.pactsDirectory);
  },

  /**
   * Logs information about loaded contracts and routes
   * @param {Array} contracts - Loaded contract objects
   * @param {Object} routes - Generated route map
   */
  logServerStart(contracts, routes) {
    console.log("Starting mock server seeded from Pact contracts...");
    console.log(`Looking for Pact contracts in: ${CONFIG.pactsDirectory}`);
    console.log(`Loaded ${contracts.length} Pact contracts`);
    console.log(
      `Created ${Object.keys(routes).length} routes from Pact interactions`,
    );
  },

  /**
   * Logs server startup success and available routes
   * @param {Object} routes - Generated route map
   */
  logServerReady(routes) {
    console.log(`Mock server running at http://localhost:${CONFIG.port}`);
    console.log("Use Ctrl+C to stop the server");
    console.log("-------------------------------------------");
    console.log("Available routes:");
    Object.keys(routes).forEach((route) => {
      console.log(`- ${route}`);
    });
  },

  /**
   * Logs individual requests and responses
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status code
   * @param {boolean} found - Whether the route was found
   */
  logRequest(method, url, status, found) {
    console.log(`${method} ${url}`);
    if (found) {
      console.log(
        `Responded with status ${status} and data from Pact contract`,
      );
    } else {
      console.log(`Route not found in Pact contracts: ${method}:${url}`);
    }
  },
};

// ============================================================================
// CONTRACT HANDLING
// ============================================================================

const ContractLoader = {
  /**
   * Loads all Pact contracts from the contracts directory
   * @returns {Array} Array of parsed contract objects
   */
  loadContracts() {
    const contracts = [];

    try {
      const providerDirs = fs.readdirSync(CONFIG.pactsDirectory);

      providerDirs.forEach((providerDir) => {
        const providerPath = path.join(CONFIG.pactsDirectory, providerDir);

        if (fs.statSync(providerPath).isDirectory()) {
          this._loadContractsFromProvider(providerPath, providerDir, contracts);
        }
      });
    } catch (error) {
      console.error("Error loading contracts directory:", error.message);
    }

    return contracts;
  },

  /**
   * Loads contract files from a specific provider directory
   * @param {string} providerPath - Path to provider directory
   * @param {string} providerDir - Name of provider directory
   * @param {Array} contracts - Array to append loaded contracts to
   * @private
   */
  _loadContractsFromProvider(providerPath, providerDir, contracts) {
    try {
      const files = fs.readdirSync(providerPath);

      files.forEach((file) => {
        if (file.endsWith(".json")) {
          this._loadContractFile(
            path.join(providerPath, file),
            providerDir,
            file,
            contracts,
          );
        }
      });
    } catch (error) {
      console.error(
        `Error reading provider directory ${providerPath}:`,
        error.message,
      );
    }
  },

  /**
   * Loads and parses an individual contract file
   * @param {string} contractPath - Path to contract file
   * @param {string} providerDir - Name of provider directory
   * @param {string} file - Name of contract file
   * @param {Array} contracts - Array to append loaded contracts to
   * @private
   */
  _loadContractFile(contractPath, providerDir, file, contracts) {
    try {
      const contractContent = fs.readFileSync(contractPath, "utf8");
      const contract = JSON.parse(contractContent);
      contracts.push(contract);
      console.log(`Loaded Pact contract: ${providerDir}/${file}`);
    } catch (error) {
      console.error(`Error parsing contract ${contractPath}:`, error.message);
    }
  },
};

// ============================================================================
// ROUTE HANDLING
// ============================================================================

const RouteBuilder = {
  /**
   * Extracts API routes from Pact contracts
   * @param {Array} contracts - Array of contract objects
   * @returns {Object} Map of routes to response configurations
   */
  buildRoutes(contracts) {
    const routes = {};

    contracts.forEach((contract) => {
      (contract.interactions || []).forEach((interaction) => {
        this._processInteraction(interaction, routes);
      });
    });

    return routes;
  },

  /**
   * Processes a single interaction from a contract
   * @param {Object} interaction - Interaction object from contract
   * @param {Object} routes - Routes map to add to
   * @private
   */
  _processInteraction(interaction, routes) {
    const { request, response } = interaction;
    const method = request.method.toUpperCase();
    const path = request.path;

    // Create a route key in format "METHOD:path"
    const routeKey = `${method}:${path}`;

    routes[routeKey] = {
      status: response.status || 200,
      headers: response.headers || {
        "Content-Type": CONFIG.defaultContentType,
      },
      body: response.body,
    };

    console.log(`Added route: ${method} ${path}`);
    console.log("Route details:", {
      method,
      path,
      status: response.status || 200,
      headers: response.headers || {
        "Content-Type": CONFIG.defaultContentType,
      },
      body: response.body,
    });
  },
};

// ============================================================================
// SERVER HANDLING
// ============================================================================

const ServerHandler = {
  /**
   * Creates an HTTP server that responds based on the route configuration
   * @param {Object} routes - Map of routes to response configurations
   * @returns {http.Server} Configured HTTP server
   */
  createServer(routes) {
    return http.createServer((req, res) => {
      this._handleRequest(req, res, routes);
    });
  },

  /**
   * Handles an individual HTTP request
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} routes - Map of routes to response configurations
   * @private
   */
  _handleRequest(req, res, routes) {
    this._setCorsHeaders(res);

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const routeKey = `${req.method}:${req.url}`;

    if (routes[routeKey]) {
      this._handleFoundRoute(req, res, routes[routeKey]);
    } else {
      this._handleNotFoundRoute(req, res, routeKey);
    }
  },

  /**
   * Sets CORS headers on the response
   * @param {http.ServerResponse} res - HTTP response
   * @private
   */
  _setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  },

  /**
   * Handles a request that matches a known route
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {Object} routeConfig - Configuration for the matched route
   * @private
   */
  _handleFoundRoute(req, res, routeConfig) {
    const { status, headers, body } = routeConfig;

    // Set response headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Send response
    res.writeHead(status);
    res.end(JSON.stringify(body));

    Logger.logRequest(req.method, req.url, status, true);
  },

  /**
   * Handles a request that doesn't match any known route
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @param {string} routeKey - Route key that wasn't found
   * @private
   */
  _handleNotFoundRoute(req, res, routeKey) {
    res.writeHead(404, { "Content-Type": CONFIG.defaultContentType });
    res.end(JSON.stringify({ error: "Not found in Pact contracts" }));

    Logger.logRequest(req.method, req.url, routeKey, 404, false);
  },
};

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================

/**
 * Main function that initializes and starts the mock server
 */
function startMockServer() {
  Logger.logConfig();

  const contracts = ContractLoader.loadContracts();
  console.log("Loaded contracts:", contracts);
  contracts.forEach((contract) => {
    (contract.interactions || []).forEach((interaction) => {
      console.log("Interaction:", JSON.stringify(interaction));
    });
  });
  const routes = RouteBuilder.buildRoutes(contracts);

  Logger.logServerStart(contracts, routes);

  const server = ServerHandler.createServer(routes);

  server.listen(CONFIG.port, () => {
    Logger.logServerReady(routes);
  });
}

// Start the server
startMockServer();
