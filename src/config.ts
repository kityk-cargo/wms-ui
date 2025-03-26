// Runtime environment variables (from window.ENV, populated by docker-entrypoint.sh)
declare global {
  interface Window {
    ENV?: {
      VITE_WMS_API_GATEWAY_URL?: string;
    };
  }
}

// Log environment variables for debugging
console.log('Environment variables:');
console.log('window.ENV:', window.ENV);
console.log(
  'import.meta.env.VITE_WMS_API_GATEWAY_URL:',
  import.meta.env.VITE_WMS_API_GATEWAY_URL,
);

// Environment configuration
export const config = {
  // Priority: 1. Runtime env (from window.ENV) 2. Build-time env (from import.meta.env)
  apiUrl:
    window.ENV?.VITE_WMS_API_GATEWAY_URL ||
    import.meta.env.VITE_WMS_API_GATEWAY_URL ||
    '',
};

// Log the actual API URL being used
console.log('Using API URL:', config.apiUrl);
