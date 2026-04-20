export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  roles: string[];
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}
