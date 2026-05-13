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
type VendorProvider = () => Promise<string | null> | string | null;
type LanguageProvider = () => string | null;
type TimezoneProvider = () => string | null;
type ErrorHandler = (message: string, code?: string, details?: any) => void;

let globalTokenProvider: TokenProvider | null = null;
let globalVendorProvider: VendorProvider | null = null;
let globalLanguageProvider: LanguageProvider | null = null;
let globalTimezoneProvider: TimezoneProvider | null = null;
let globalErrorHandler: ErrorHandler | null = null;
let isApiLocked = false;

/**
 * Manually lock the API to prevent any further outgoing requests.
 * Useful when session expires to prevent request storms.
 */
export const lockApi = () => {
  isApiLocked = true;
};

/**
 * Unlock the API to allow requests again.
 * Should be called after a successful login or when reaching the login page.
 */
export const unlockApi = () => {
  isApiLocked = false;
};

/** 
 * Allows the consuming platform (Web/Mobile) to define how tokens are retrieved 
 * without injecting next-auth or secure-store directly into the infrastructure package.
 */
export const setTokenProvider = (provider: TokenProvider) => {
  globalTokenProvider = provider;
};

/** 
 * Allows the consuming platform to define how the active vendor (personId) is retrieved
 */
export const setVendorProvider = (provider: VendorProvider) => {
  globalVendorProvider = provider;
};

export const setLanguageProvider = (provider: LanguageProvider) => {
  globalLanguageProvider = provider;
};

export const setTimezoneProvider = (provider: TimezoneProvider) => {
  globalTimezoneProvider = provider;
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
      'Content-Type': 'application/json',
    }
  });

  // Global Request Interceptor (Auth, Logging, etc.)
  instance.interceptors.request.use(async (config) => {
    // If API is locked (e.g. session expired), abort immediately
    if (isApiLocked) {
      console.warn("Infrastructure: API is currently LOCKED. Aborting request to:", config.url);
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort('API is locked due to session expiration');
      return Promise.reject(new Error('API_LOCKED'));
    }

    try {
      if (globalLanguageProvider) {
        const lang = globalLanguageProvider();
        if (lang) {
          config.headers['Accept-Language'] = lang;
        }
      }

      if (globalTimezoneProvider) {
        const tz = globalTimezoneProvider();
        if (tz) {
          config.headers['Time-Zone'] = tz;
        }
      }

      if (globalTokenProvider) {
        const token = await globalTokenProvider();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log(`[API Request] Token Length: ${token.length}, Dots: ${(token.match(/\./g) || []).length}`);
        }
      }
      
      if (globalVendorProvider) {
        // Use a Promise.race to ensure it doesn't block forever if session fetching hangs
        // 5 seconds timeout is reasonable for session fetching
        const vendorId = await Promise.race([
          globalVendorProvider(),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Vendor provider timeout')), 5000))
        ]);
        
        if (vendorId) {
          config.headers['X-Vendor-Id'] = String(vendorId);
        }
      }

      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        Authorization: config.headers['Authorization'] ? 'Present' : 'Missing',
        VendorId: config.headers['X-Vendor-Id'] || 'Missing'
      });
    } catch (error) {
      console.warn("Infrastructure: Request interceptor error", error);
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

      if (code === '401') {
        console.warn(`[API Error Detail] 401 Unauthorized for ${moduleName}:`, error.response?.data);
        // lockApi(); // Commented for debugging
      }

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
