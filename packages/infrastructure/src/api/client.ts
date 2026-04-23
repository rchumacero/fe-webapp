import axios from 'axios';

/**
 * Use static references for Next.js to allow Webpack to inline the environment variables at build time.
 * Dynamic access like process.env[key] returns undefined on the client in Next.js.
 */
const getGatewayUrl = () => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) return process.env.NEXT_PUBLIC_API_GATEWAY_URL;
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (process.env.API_GATEWAY_URL) return process.env.API_GATEWAY_URL;
    if (process.env.API_URL) return process.env.API_URL;
    // @ts-ignore (for Vite support if needed)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_API_GATEWAY_URL) return import.meta.env.VITE_API_GATEWAY_URL;
      // @ts-ignore
      if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    }
  }
  return 'https://api-dev-local.kplian.com';
};

const GATEWAY_BASE_URL = getGatewayUrl();

type TokenProvider = () => Promise<string | null> | string | null;
type ErrorHandler = (message: string, code?: string, details?: any) => void;

let globalTokenProvider: TokenProvider | null = null;
let globalErrorHandler: ErrorHandler | null = null;

/** 
 * Allows the consuming platform (Web/Mobile) to define how tokens are retrieved 
 * without injecting next-auth or secure-store directly into the infrastructure package.
 */
export const setTokenProvider = (provider: TokenProvider) => {
  globalTokenProvider = provider;
};

/**
 * Allows the consuming platform to register a global error handler (e.g., toast)
 */
export const setGlobalErrorHandler = (handler: ErrorHandler) => {
  globalErrorHandler = handler;
};

/**
 * Creates dynamic Axios instances for specific business modules
 * @param moduleName - The name of the microservice/module (e.g., 'crm', 'access', 'inventory')
 */
export const createApiClient = (moduleName: string) => {
  const instance = axios.create({
    baseURL: `${GATEWAY_BASE_URL}/${moduleName}/api`,
    headers: {
      'Accept-Language': 'es-ES',
      'Content-Type': 'application/json',
    }
  });

  // Global Request Interceptor (Auth, Logging, etc.)
  instance.interceptors.request.use(async (config) => {
    if (globalTokenProvider) {
      const token = await globalTokenProvider();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Global Response Interceptor (Error handling, Data formatting)
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      const code = error.response?.status?.toString();
      const details = error.response?.data?.details;

      console.error(`[API Error] Module: ${moduleName} | Message: ${message}`);

      if (globalErrorHandler) {
        globalErrorHandler(message, code, details);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Default export for generic use cases
const defaultApiClient = createApiClient('core');
export default defaultApiClient;
