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
// PROVIDER STATE MANAGEMENT
// ============================================================================

const ProviderStateManager = {
  // Current active provider states and path restriction
  currentStates: [],
  currentPath: null,

  // Available states and route mappings
  availableStates: new Set(),
  stateRoutes: new Map(),

  /**
   * Sets the current provider states
   * @param {Array<string>} states - Array of state names to set
   * @param {string} [path] - Optional path to limit scope
   * @returns {Object} Result with success status and warnings
   */
  setStates(states, path = null) {
    const warnings = [];
    const validStates = states.filter((state) => {
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

  /**
   * Resets provider states to default behavior
   */
  reset() {
    this.currentStates = [];
    this.currentPath = null;
  },

  /**
   * Gets all available provider states
   * @returns {Array<string>} Array of available state names
   */
  getAvailableStates() {
    return Array.from(this.availableStates);
  },

  /**
   * Adds provider states from interaction and stores route mapping
   * @param {string} routeKey - Route key (METHOD:path)
   * @param {Object} interaction - Interaction object
   * @param {Object} routeConfig - Route configuration
   */
  addInteraction(routeKey, interaction, routeConfig) {
    const states = this._extractStates(interaction);
    states.forEach((state) => this.availableStates.add(state));

    if (!this.stateRoutes.has(routeKey)) {
      this.stateRoutes.set(routeKey, []);
    }

    this.stateRoutes.get(routeKey).push({ routeConfig, states });
  },

  /**
   * Finds the best matching route configuration based on current provider states
   * @param {string} routeKey - Route key to match
   * @returns {Object|null} Route configuration or null if not found
   */
  getMatchingRoute(routeKey) {
    const options = this.stateRoutes.get(routeKey);
    if (!options?.length) return null;

    // If current states are set, try to match them (ANY logic)
    if (this.currentStates.length > 0) {
      // If path scoping is active, check if tis route matches the scoped path
      if (this.currentPath) {
        const [, routePath] = routeKey.split(":");
        if (!routePath.startsWith(this.currentPath)) {
          // Route doesn't match scoped path, skip state-based matching
          return this._getDefaultRoute(options);
        }
      }

      // Find route that matches any of the current states
      for (const currentState of this.currentStates) {
        const match = options.find((option) =>
          option.states.includes(currentState),
        );
        if (match) return match.routeConfig;
      }
    }

    return this._getDefaultRoute(options);
  },

  /**
   * Gets the default route configuration (no provider state, prefer 2xx status codes)
   * @param {Array} options - Available route options
   * @returns {Object} Route configuration
   * @private
   */
  _getDefaultRoute(options) {
    // Default behavior: prefer no provider state, then 2xx status codes
    const noStateOptions = options.filter(
      (option) => option.states.length === 0,
    );
    if (noStateOptions.length > 0) {
      const twoxxOption = noStateOptions.find(
        (option) =>
          option.routeConfig.status >= 200 && option.routeConfig.status < 300,
      );
      return twoxxOption
        ? twoxxOption.routeConfig
        : noStateOptions[0].routeConfig;
    }

    // If no no-state options, pick first 2xx from any option
    const twoxxOption = options.find(
      (option) =>
        option.routeConfig.status >= 200 && option.routeConfig.status < 300,
    );

    return twoxxOption ? twoxxOption.routeConfig : options[0].routeConfig;
  },

  /**
   * Extracts provider states from an interaction
   * @param {Object} interaction - Pact interaction object
   * @returns {Array<string>} Array of state names
   * @private
   */
  _extractStates(interaction) {
    const states = [];

    if (interaction.providerState) {
      states.push(interaction.providerState);
    }

    if (interaction.providerStates?.length) {
      interaction.providerStates.forEach((stateObj) => {
        if (stateObj.name) states.push(stateObj.name);
      });
    }

    return states;
  },
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
   * Logs provider state management help
   */
  logProviderStateHelp() {
    const availableStates = ProviderStateManager.getAvailableStates();

    console.log("-------------------------------------------");
    console.log("Provider State Management:");
    console.log(
      '- Set state: POST /api/mock-server/state {"state": "state_name"}',
    );
    console.log(
      '- Set multiple: POST /api/mock-server/state {"states": ["state1", "state2"]}',
    );
    console.log(
      '- Limit scope: POST /api/mock-server/state {"state": "state_name", "path": "/api/path"}',
    );
    console.log("- Reset states: POST /api/mock-server/reset");

    if (availableStates.length > 0) {
      console.log("Available provider states:");
      availableStates.forEach((state) => {
        console.log(`  - "${state}"`);
      });
    }
    console.log("-------------------------------------------");
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

    const routeConfig = {
      status: response.status || 200,
      headers: response.headers || {
        "Content-Type": CONFIG.defaultContentType,
      },
      body: response.body,
    };

    // Store in both old format (for backward compatibility) and new state-aware format
    routes[routeKey] = routeConfig;

    // Add interaction to provider state manager
    ProviderStateManager.addInteraction(routeKey, interaction, routeConfig);

    console.log(`Added route: ${method} ${path}`);
    const states = ProviderStateManager._extractStates(interaction);
    if (states.length > 0) {
      console.log(`  Provider states: ${states.join(", ")}`);
    }
    console.log("Route details:", {
      method,
      path,
      status: response.status || 200,
      headers: response.headers || {
        "Content-Type": CONFIG.defaultContentType,
      },
      body: response.body,
      providerStates: states,
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

    // Handle state management APIs
    if (this._isStateManagementAPI(req)) {
      this._handleStateManagementAPI(req, res);
      return;
    }

    const routeKey = `${req.method}:${req.url}`;

    // Try state-aware route matching first, then fall back to original routes
    const stateAwareRoute = ProviderStateManager.getMatchingRoute(routeKey);
    const routeConfig = stateAwareRoute || routes[routeKey];

    if (routeConfig) {
      this._handleFoundRoute(req, res, routeConfig);
    } else {
      this._handleNotFoundRoute(req, res, routeKey);
    }
  },

  /**
   * Checks if the request is for state management APIs
   * @param {http.IncomingMessage} req - HTTP request
   * @returns {boolean} True if this is a state management API call
   * @private
   */
  _isStateManagementAPI(req) {
    return (
      req.url === "/api/mock-server/state" ||
      req.url === "/api/mock-server/reset"
    );
  },

  /**
   * Handles state management API requests
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @private
   */
  _handleStateManagementAPI(req, res) {
    if (req.url === "/api/mock-server/state" && req.method === "POST") {
      this._handleSetState(req, res);
    } else if (req.url === "/api/mock-server/reset" && req.method === "POST") {
      this._handleResetState(req, res);
    } else {
      res.writeHead(405, { "Content-Type": CONFIG.defaultContentType });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }
  },

  /**
   * Handles state setting API
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @private
   */
  _handleSetState(req, res) {
    this._parseRequestBody(req, (body) => {
      try {
        const requestData = JSON.parse(body);
        let states = [];

        // Handle both single state and multiple states
        if (requestData.state) {
          states = [requestData.state];
        } else if (requestData.states?.length) {
          states = requestData.states;
        } else {
          res.writeHead(400, { "Content-Type": CONFIG.defaultContentType });
          res.end(
            JSON.stringify({
              error:
                'Invalid request format. Expected {"state": "name"} or {"states": ["name1", "name2"]}',
            }),
          );
          return;
        }

        const result = ProviderStateManager.setStates(states, requestData.path);

        const responseBody = {
          message: `Provider state(s) set ${result.warnings.length > 0 ? "with warnings" : "successfully"}`,
          validStates: result.validStates,
          ...(result.warnings.length > 0 && {
            warnings: result.warnings,
            availableStates: result.availableStates,
          }),
        };

        res.writeHead(200, { "Content-Type": CONFIG.defaultContentType });
        res.end(JSON.stringify(responseBody));

        console.log(`Provider states set: ${result.validStates.join(", ")}`);
        if (requestData.path)
          console.log(`Limited to path: ${requestData.path}`);
        if (result.warnings.length > 0)
          console.log(`Warnings: ${result.warnings.join(", ")}`);
      } catch (error) {
        res.writeHead(400, { "Content-Type": CONFIG.defaultContentType });
        res.end(
          JSON.stringify({
            error: "Invalid JSON in request body" + error.message,
            availableStates: ProviderStateManager.getAvailableStates(),
          }),
        );
      }
    });
  },

  /**
   * Handles state reset API
   * @param {http.IncomingMessage} req - HTTP request
   * @param {http.ServerResponse} res - HTTP response
   * @private
   */
  _handleResetState(req, res) {
    ProviderStateManager.reset();

    res.writeHead(200, { "Content-Type": CONFIG.defaultContentType });
    res.end(
      JSON.stringify({
        message: "Provider states reset to default behavior",
      }),
    );

    console.log("Provider states reset to default behavior");
  },

  /**
   * Parses request body
   * @param {http.IncomingMessage} req - HTTP request
   * @param {Function} callback - Callback function with parsed body
   * @private
   */
  _parseRequestBody(req, callback) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      callback(body);
    });
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
    Logger.logProviderStateHelp();
  });
}

// Start the server
startMockServer();
