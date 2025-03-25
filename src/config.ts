// Runtime environment variables (from window.ENV, populated by docker-entrypoint.sh)
declare global {
  interface Window {
    ENV?: {
      VITE_WMS_API_GATEWAY_URL?: string;
    };
  }
}

// Environment configuration
export const config = {
  // Priority: 1. Runtime env (from window.ENV) 2. Build-time env (from import.meta.env) 3. Default value
  apiUrl:
    window.ENV?.VITE_WMS_API_GATEWAY_URL ||
    import.meta.env.VITE_WMS_API_GATEWAY_URL ||
    'http://localhost:8080',
};
