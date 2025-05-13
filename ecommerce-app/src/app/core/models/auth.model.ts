import { User } from './user.model';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_SELLER';
}
