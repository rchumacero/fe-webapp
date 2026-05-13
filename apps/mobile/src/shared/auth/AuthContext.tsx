import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import { setTokenProvider, setLanguageProvider, setTimezoneProvider, setGlobalErrorHandler, setVendorProvider } from '@kplian/infrastructure';
import i18n from '@kplian/i18n';
import { User } from '@kplian/core';

// Helper for cross-platform storage (SecureStore doesn't work in Web)
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
};

// Ensure these environment variables are actually sourced properly in your mobile env
const ZITADEL_ISSUER = process.env.EXPO_PUBLIC_ZITADEL_ISSUER || 'https://dev-zitadel.kplian.com';
const ZITADEL_CLIENT_ID = process.env.EXPO_PUBLIC_ZITADEL_CLIENT_ID || '';

// Deep Linking redirect URI
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'com.myapp.crm', // Must match your scheme in app.json
  path: 'oauth-callback',
});

console.log('[Auth Debug] Client ID:', ZITADEL_CLIENT_ID);
console.log('[Auth Debug] Redirect URI:', redirectUri);

// PKCE helpers for manual Web redirect flow
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Discovery document
const discovery = {
  authorizationEndpoint: `${ZITADEL_ISSUER}/oauth/v2/authorize`,
  tokenEndpoint: `${ZITADEL_ISSUER}/oauth/v2/token`,
  revocationEndpoint: `${ZITADEL_ISSUER}/oauth/v2/revoke`,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: ZITADEL_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email', 'offline_access', 'urn:zitadel:iam:org:project:id:zitadel:aud'],
      usePKCE: true, // Native Client requirement
    },
    discovery
  );

  useEffect(() => {
    const initialize = async () => {
      // 1. Handle OAuth callback on Web (direct redirect, not popup)
      if (Platform.OS === 'web' && window.location.search.includes('code=')) {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          // Clean up URL immediately
          window.history.replaceState({}, document.title, window.location.pathname);
          // Retrieve PKCE verifier stored before redirect
          const codeVerifier = await storage.getItem('pkce_verifier') || '';
          await exchangeCode(code, codeVerifier);
          await storage.deleteItem('pkce_verifier');
          return; // Tokens already set, skip loadSession
        }
      }

      // 2. Storage Setup: inject token getter for API client
      setTokenProvider(async () => {
        try {
          return (await storage.getItem('idToken')) || (await storage.getItem('accessToken'));
        } catch (e) {
          return null;
        }
      });
      setLanguageProvider(() => i18n.language || 'es');
      setTimezoneProvider(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
      setVendorProvider(async () => {
        try {
          return await storage.getItem('vendorPersonId');
        } catch (e) {
          return null;
        }
      });

      // Handle 401 globally (Disabled for debugging 401 issues)
      /*
      setGlobalErrorHandler((message, code) => {
        if (code === '401') {
          logout();
        }
      });
      */

      // 3. Attempt to restore existing session from storage
      await loadSession();
    };

    initialize();
  }, [request]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      exchangeCode(code);
    }
  }, [response]);

  const loadSession = async () => {
    try {
      const idToken = await storage.getItem('idToken');
      const accessToken = await storage.getItem('accessToken');
      const token = idToken || accessToken;
      if (token) {
        const dots = (token.match(/\./g) || []).length;
        console.log('[Auth Debug] Restored Token Stats:', { length: token.length, dots });
        setAccessToken(accessToken);
        setIdToken(idToken);
        await getUserInfo(token);
        await loadVendor(token);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeCode = async (code: string, codeVerifier?: string) => {
    setIsLoading(true);
    try {
      const verifier = codeVerifier || request?.codeVerifier || '';
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: ZITADEL_CLIENT_ID,
          code,
          redirectUri,
          scopes: ['openid', 'profile', 'email', 'offline_access', 'urn:zitadel:iam:org:project:id:zitadel:aud'],
          extraParams: { code_verifier: verifier },
        },
        discovery
      );
      
      await storage.setItem('accessToken', tokenResult.accessToken);
      if (tokenResult.idToken) {
        await storage.setItem('idToken', tokenResult.idToken);
      }
      if (tokenResult.refreshToken) {
        await storage.setItem('refreshToken', tokenResult.refreshToken);
      }
      setAccessToken(tokenResult.accessToken);
      setIdToken(tokenResult.idToken || null);
      
      const token = tokenResult.accessToken;
      const dots = (token.match(/\./g) || []).length;
      console.log('[Auth Debug] Token Stats:', {
        length: token.length,
        dots: dots,
        firstChars: token.substring(0, 20),
        lastChars: token.substring(token.length - 20)
      });

      await getUserInfo(tokenResult.accessToken);
      await loadVendor(tokenResult.accessToken);
    } catch (err) {
      console.error("Error exchanging code", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async (token: string) => {
    try {
      const res = await fetch(`${ZITADEL_ISSUER}/oidc/v1/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      setUser({
        id: data.sub,
        username: data.preferred_username,
        name: data.name || data.preferred_username,
        email: data.email,
        roles: data['urn:zitadel:iam:org:project:roles'] ? Object.keys(data['urn:zitadel:iam:org:project:roles']) : []
      });
    } catch (err) {
      console.error("Error fetching user profile", err);
    }
  };

  const loadVendor = async (token: string) => {
    try {
      // 1. Get userinfo to get the preferred_username (code)
      const uiRes = await fetch(`${ZITADEL_ISSUER}/oidc/v1/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const uiData = await uiRes.json();
      const userCode = uiData.preferred_username;

      if (userCode) {
        // 2. Fetch person by code from CRM
        const apiBase = process.env.API_GATEWAY_URL || 'https://api-dev-local.kplian.com';
        const res = await fetch(`${apiBase}/crm/api/v1/persons/by-code/${userCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const person = await res.json();
          if (person && person.id) {
            await storage.setItem('vendorPersonId', String(person.id));
            console.log('[Auth Debug] Vendor ID set:', person.id);
          }
        } else {
          console.warn('[Auth Debug] Failed to fetch vendor info', res.status);
        }
      }
    } catch (err) {
      console.error("Error loading vendor session", err);
    }
  };

  const login = async () => {
    if (Platform.OS === 'web') {
      // On Web: use direct page redirect (browsers block window.open from useEffect)
      // Manually build PKCE flow
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store verifier to use on callback
      await storage.setItem('pkce_verifier', codeVerifier);
      
      const params = new URLSearchParams({
        client_id: ZITADEL_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid profile email offline_access urn:zitadel:iam:org:project:id:zitadel:aud',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });
      
      window.location.href = `${discovery.authorizationEndpoint}?${params.toString()}`;
    } else {
      // On Native: use popup (Expo AuthSession handles this correctly)
      await promptAsync();
    }
  };

  const logout = async () => {
    await storage.deleteItem('accessToken');
    await storage.deleteItem('idToken');
    await storage.deleteItem('refreshToken');
    await storage.deleteItem('vendorPersonId');
    
    if (Platform.OS === 'web') {
      const postLogoutUrl = window.location.origin;
      let logoutUrl = `${ZITADEL_ISSUER}/oidc/v1/end_session?post_logout_redirect_uri=${encodeURIComponent(postLogoutUrl)}`;
      if (idToken) {
        logoutUrl += `&id_token_hint=${idToken}`;
      }
      window.location.href = logoutUrl;
    }
    
    setUser(null);
    setAccessToken(null);
    setIdToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
