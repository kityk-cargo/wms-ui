#!/usr/bin/env node

const pact = require('@pact-foundation/pact-node');
const path = require('path');

console.log('🚀 Starting Pact Mock Server...');

const server = pact.createStub({
  pactUrls: [
    path.resolve(__dirname, 'pacts/wms_order_management/wms_ui.json'),
    path.resolve(__dirname, 'pacts/wms_inventory_management/wms_ui.json')
  ],
  port: 30081,
  cors: true,
  logLevel: 'INFO'
});

server.start().then(() => {
  console.log(`✅ Pact Mock Server started successfully!`);
  console.log(`📍 Server running at: http://localhost:30081`);
  console.log(`📁 Serving contracts from:`);
  console.log(`   - wms_order_management/wms_ui.json`);
  console.log(`   - wms_inventory_management/wms_ui.json`);
  console.log(`\n🛑 Press Ctrl+C to stop the server`);
  
  // Keep the process alive
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Pact Mock Server...');
    server.stop().then(() => {
      console.log('✅ Server stopped successfully');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Pact Mock Server...');
    server.stop().then(() => {
      console.log('✅ Server stopped successfully');
      process.exit(0);
    });
  });
}).catch((error) => {
  console.error('❌ Failed to start Pact Mock Server:', error);
  process.exit(1);
}); 