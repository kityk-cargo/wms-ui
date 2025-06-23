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
  pactsDir: path.join(__dirname, "pacts"),
  contentType: "application/json",
};

// ============================================================================
// CUSTOM ROUTES SECTION
// ============================================================================
/**
 * Custom routes that are not present in Pact contracts.
 * These are useful for quick experimentation, reproducing bugs,
 * or testing scenarios not covered by official contracts.
 *
 * WARNING: Custom routes should not conflict with existing contract routes
 * for the same state. Server will fail to start if conflicts are detected.
 *
 * Format:
 * {
 *   method: "GET|POST|PUT|DELETE",
 *   path: "/api/path",
 *   state: "provider state name", // optional, for state-based responses
 *   response: {
 *     status: number,
 *     headers: object,
 *     body: any
 *   }
 * }
 */
const CUSTOM_ROUTES = [
  // Example: Products error route
  {
    method: "GET",
    path: "/api/v1/products",
    state: "get products error out",
    response: {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        error: "Internal Server Error",
        message: "Products service is currently unavailable",
        code: "PRODUCTS_SERVICE_ERROR",
      },
    },
  },

  // Add more custom routes here as needed
  // {
  //   method: "POST",
  //   path: "/api/v1/orders",
  //   state: "order creation fails",
  //   response: {
  //     status: 422,
  //     headers: { "Content-Type": "application/json" },
  //     body: { error: "Validation failed", details: ["Invalid customer ID"] }
  //   }
  // }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const createRouteKey = (method, path) => `${method.toUpperCase()}:${path}`;

const createRouteConfig = (response) => ({
  status: response.status || 200,
  headers: response.headers || { "Content-Type": CONFIG.contentType },
  body: response.body,
});

const findSuccessRoute = (options) =>
  options.find(
    (opt) => opt.routeConfig.status >= 200 && opt.routeConfig.status < 300,
  );

const findNoStateRoutes = (options) =>
  options.filter((opt) => opt.states.length === 0);

const extractStates = (interaction) => {
  const states = [];

  if (interaction.providerState) states.push(interaction.providerState);
  if (interaction.providerStates?.length) {
    interaction.providerStates.forEach((stateObj) => {
      if (stateObj.name) states.push(stateObj.name);
    });
  }
  if (interaction.state) states.push(interaction.state);

  return states;
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const StateManager = {
  currentStates: [],
  currentPath: null,
  availableStates: new Set(),
  stateRoutes: new Map(),
  customStates: new Set(),
  contractStates: new Set(),

  setStates(states, path = null) {
    const warnings = [];
    const validStates = states.filter((state) => {
      if (this.availableStates.has(state)) return true;
      warnings.push(`${state} not found in contracts or custom routes`);
      return false;
    });

    this.currentStates = validStates;
    this.currentPath = path;

    return {
      warnings,
      validStates,
      availableStates: Array.from(this.availableStates),
    };
  },

  reset() {
    this.currentStates = [];
    this.currentPath = null;
  },

  getAvailableStates() {
    return Array.from(this.availableStates);
  },

  addRoute(routeKey, interaction, routeConfig, isCustom = false) {
    const states = extractStates(interaction);

    states.forEach((state) => {
      this.availableStates.add(state);
      if (isCustom) this.customStates.add(state);
      else this.contractStates.add(state);
    });

    if (!this.stateRoutes.has(routeKey)) {
      this.stateRoutes.set(routeKey, []);
    }

    this.stateRoutes.get(routeKey).push({ routeConfig, states, isCustom });
  },

  validateNoConflicts() {
    const conflicts = [];

    for (const [routeKey, options] of this.stateRoutes.entries()) {
      const customOptions = options.filter((opt) => opt.isCustom);
      const contractOptions = options.filter((opt) => !opt.isCustom);

      if (customOptions.length > 0 && contractOptions.length > 0) {
        for (const customOpt of customOptions) {
          for (const contractOpt of contractOptions) {
            const customStates = new Set(customOpt.states);
            const contractStates = new Set(contractOpt.states);

            const overlap = [...customStates].some((state) =>
              contractStates.has(state),
            );

            if (overlap) {
              conflicts.push({
                route: routeKey,
                conflictingStates: [...customStates].filter((state) =>
                  contractStates.has(state),
                ),
              });
            }
          }
        }
      }
    }

    if (conflicts.length > 0) {
      const errorMsg = conflicts
        .map(
          (conflict) =>
            `Route ${conflict.route} has conflicting states: ${conflict.conflictingStates.join(", ")}`,
        )
        .join("\n");

      throw new Error(
        `Custom route conflicts detected:\n${errorMsg}\n\nCustom routes cannot use the same state as contract routes for the same endpoint.`,
      );
    }
  },

  findRoute(routeKey) {
    const options = this.stateRoutes.get(routeKey);
    if (!options?.length) return null;

    if (this.currentStates.length > 0) {
      if (this.currentPath) {
        const [, routePath] = routeKey.split(":");
        if (!routePath.startsWith(this.currentPath)) {
          return this._getDefaultRoute(options);
        }
      }

      for (const currentState of this.currentStates) {
        const match = options.find((option) =>
          option.states.includes(currentState),
        );
        if (match) return match.routeConfig;
      }
    }

    return this._getDefaultRoute(options);
  },

  _getDefaultRoute(options) {
    const contractOptions = options.filter((opt) => !opt.isCustom);
    const customOptions = options.filter((opt) => opt.isCustom);

    // Try contract routes first
    if (contractOptions.length > 0) {
      const noStateOptions = findNoStateRoutes(contractOptions);
      if (noStateOptions.length > 0) {
        return (
          findSuccessRoute(noStateOptions)?.routeConfig ||
          noStateOptions[0].routeConfig
        );
      }

      const successRoute = findSuccessRoute(contractOptions);
      if (successRoute) return successRoute.routeConfig;
    }

    // Fall back to custom routes
    if (customOptions.length > 0) {
      const noStateOptions = findNoStateRoutes(customOptions);
      if (noStateOptions.length > 0) {
        return (
          findSuccessRoute(noStateOptions)?.routeConfig ||
          noStateOptions[0].routeConfig
        );
      }

      const successRoute = findSuccessRoute(customOptions);
      if (successRoute) return successRoute.routeConfig;
    }

    return options[0].routeConfig;
  },
};

// ============================================================================
// LOGGING
// ============================================================================

const Logger = {
  logConfig() {
    console.log("Configuration:");
    console.log(
      "- Port:",
      CONFIG.port,
      process.env.MOCK_SERVER_PORT ? "(from .env)" : "(default)",
    );
    console.log("- Pacts directory:", CONFIG.pactsDir);
    console.log("- Custom routes defined:", CUSTOM_ROUTES.length);
  },

  logServerStart(contracts, routes, customRouteCount) {
    console.log(
      "Starting mock server with Pact contracts and custom routes...",
    );
    console.log(`Loaded ${contracts.length} Pact contracts`);
    console.log(`Added ${customRouteCount} custom routes`);
    console.log(`Created ${Object.keys(routes).length} total routes`);
  },

  logServerReady(routes) {
    console.log(`Mock server running at http://localhost:${CONFIG.port}`);
    console.log("Use Ctrl+C to stop the server");
    console.log("-------------------------------------------");
    console.log("Available routes:");
    Object.keys(routes).forEach((route) => console.log(`- ${route}`));
  },

  logStateHelp() {
    const contractStates = Array.from(StateManager.contractStates);
    const customStates = Array.from(StateManager.customStates);

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

    if (contractStates.length > 0) {
      console.log("Contract states:");
      contractStates.forEach((state) => console.log(`  - "${state}"`));
    }

    if (customStates.length > 0) {
      console.log("Custom states:");
      customStates.forEach((state) => console.log(`  - "${state}"`));
    }
    console.log("-------------------------------------------");
  },

  logRequest(method, url, status, found, isCustom = false) {
    console.log(`${method} ${url}`);
    if (found) {
      const source = isCustom ? "custom route" : "Pact contract";
      console.log(`Responded with status ${status} from ${source}`);
    } else {
      console.log(`Route not found: ${method}:${url}`);
    }
  },
};

// ============================================================================
// CONTRACT LOADING
// ============================================================================

const ContractLoader = {
  loadContracts() {
    const contracts = [];

    try {
      const providerDirs = fs.readdirSync(CONFIG.pactsDir);

      providerDirs.forEach((providerDir) => {
        const providerPath = path.join(CONFIG.pactsDir, providerDir);
        if (fs.statSync(providerPath).isDirectory()) {
          this._loadFromProvider(providerPath, providerDir, contracts);
        }
      });
    } catch (error) {
      console.error("Error loading contracts directory:", error.message);
    }

    return contracts;
  },

  _loadFromProvider(providerPath, providerDir, contracts) {
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

  _loadContractFile(contractPath, providerDir, file, contracts) {
    try {
      const contractContent = fs.readFileSync(contractPath, "utf8");
      const contract = JSON.parse(contractContent);
      contracts.push(contract);
      console.log(`Loaded: ${providerDir}/${file}`);
    } catch (error) {
      console.error(`Error parsing contract ${contractPath}:`, error.message);
    }
  },
};

// ============================================================================
// ROUTE BUILDING
// ============================================================================

const RouteBuilder = {
  buildRoutes(contracts) {
    const routes = {};

    // Process contract interactions
    contracts.forEach((contract) => {
      (contract.interactions || []).forEach((interaction) => {
        this._processInteraction(interaction, routes, false);
      });
    });

    // Process custom routes
    const customRouteCount = this._processCustomRoutes(routes);

    console.log(`CUSTOM Routes: ${customRouteCount} custom routes loaded`);

    StateManager.validateNoConflicts();

    return routes;
  },

  _processCustomRoutes(routes) {
    let count = 0;

    CUSTOM_ROUTES.forEach((customRoute) => {
      const { method, path, state, response } = customRoute;
      const routeKey = createRouteKey(method, path);
      const routeConfig = createRouteConfig(response);

      routes[routeKey] = routeConfig;

      const mockInteraction = {
        state: state || null,
        request: { method: method.toUpperCase(), path },
        response,
      };

      StateManager.addRoute(routeKey, mockInteraction, routeConfig, true);

      console.log(
        `Added custom route: ${method.toUpperCase()} ${path}${state ? ` (state: ${state})` : ""}`,
      );
      count++;
    });

    return count;
  },

  _processInteraction(interaction, routes, isCustom = false) {
    const { request, response } = interaction;
    const method = request.method.toUpperCase();
    const path = request.path;
    const routeKey = createRouteKey(method, path);
    const routeConfig = createRouteConfig(response);

    routes[routeKey] = routeConfig;
    StateManager.addRoute(routeKey, interaction, routeConfig, isCustom);

    const states = extractStates(interaction);
    const routeType = isCustom ? "custom route" : "route";
    console.log(
      `Added ${routeType}: ${method} ${path}${states.length > 0 ? ` (states: ${states.join(", ")})` : ""}`,
    );
  },
};

// ============================================================================
// HTTP SERVER
// ============================================================================

const Server = {
  create(routes) {
    return http.createServer((req, res) => {
      this._handleRequest(req, res, routes);
    });
  },

  _handleRequest(req, res, routes) {
    this._setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (this._isStateAPI(req)) {
      this._handleStateAPI(req, res);
      return;
    }

    const routeKey = createRouteKey(req.method, req.url);
    const stateAwareMatch = StateManager.findRoute(routeKey);
    const routeConfig = stateAwareMatch || routes[routeKey];

    if (routeConfig) {
      let isCustom = false;
      if (stateAwareMatch) {
        const options = StateManager.stateRoutes.get(routeKey);
        const matchedOption = options?.find(
          (option) => option.routeConfig === stateAwareMatch,
        );
        isCustom = matchedOption?.isCustom || false;
      }

      this._sendResponse(req, res, routeConfig, isCustom);
    } else {
      this._sendNotFound(req, res);
    }
  },

  _isStateAPI(req) {
    return (
      req.url === "/api/mock-server/state" ||
      req.url === "/api/mock-server/reset"
    );
  },

  _handleStateAPI(req, res) {
    if (req.url === "/api/mock-server/state" && req.method === "POST") {
      this._handleSetState(req, res);
    } else if (req.url === "/api/mock-server/reset" && req.method === "POST") {
      this._handleResetState(req, res);
    } else {
      res.writeHead(405, { "Content-Type": CONFIG.contentType });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }
  },

  _handleSetState(req, res) {
    this._parseBody(req, (body) => {
      try {
        const data = JSON.parse(body);
        const states = data.state ? [data.state] : data.states || [];

        if (states.length === 0) {
          res.writeHead(400, { "Content-Type": CONFIG.contentType });
          res.end(
            JSON.stringify({
              error:
                'Invalid request format. Expected {"state": "name"} or {"states": ["name1", "name2"]}',
            }),
          );
          return;
        }

        const result = StateManager.setStates(states, data.path);
        const responseBody = {
          message: `Provider state(s) set ${result.warnings.length > 0 ? "with warnings" : "successfully"}`,
          validStates: result.validStates,
          ...(result.warnings.length > 0 && {
            warnings: result.warnings,
            availableStates: result.availableStates,
          }),
        };

        res.writeHead(200, { "Content-Type": CONFIG.contentType });
        res.end(JSON.stringify(responseBody));

        console.log(`States set: ${result.validStates.join(", ")}`);
        if (data.path) console.log(`Limited to path: ${data.path}`);
        if (result.warnings.length > 0)
          console.log(`Warnings: ${result.warnings.join(", ")}`);
      } catch (error) {
        res.writeHead(400, { "Content-Type": CONFIG.contentType });
        res.end(
          JSON.stringify({
            error: "Invalid JSON: " + error.message,
            availableStates: StateManager.getAvailableStates(),
          }),
        );
      }
    });
  },

  _handleResetState(req, res) {
    StateManager.reset();
    res.writeHead(200, { "Content-Type": CONFIG.contentType });
    res.end(
      JSON.stringify({ message: "Provider states reset to default behavior" }),
    );
    console.log("States reset to default behavior");
  },

  _parseBody(req, callback) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => callback(body));
  },

  _setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  },

  _sendResponse(req, res, routeConfig, isCustom = false) {
    const { status, headers, body } = routeConfig;

    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.writeHead(status);
    res.end(JSON.stringify(body));

    Logger.logRequest(req.method, req.url, status, true, isCustom);
  },

  _sendNotFound(req, res) {
    res.writeHead(404, { "Content-Type": CONFIG.contentType });
    res.end(
      JSON.stringify({ error: "Not found in Pact contracts or custom routes" }),
    );
    Logger.logRequest(req.method, req.url, 404, false);
  },
};

// ============================================================================
// MAIN
// ============================================================================

function startMockServer() {
  Logger.logConfig();

  const contracts = ContractLoader.loadContracts();
  const routes = RouteBuilder.buildRoutes(contracts);

  Logger.logServerStart(contracts, routes, CUSTOM_ROUTES.length);

  const server = Server.create(routes);

  server.listen(CONFIG.port, () => {
    Logger.logServerReady(routes);
    Logger.logStateHelp();
  });
}

startMockServer();
