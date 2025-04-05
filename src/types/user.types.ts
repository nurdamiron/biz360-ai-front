// src/types/user.types.ts

export enum UserRole {
    ADMIN = 'admin',
    DEVELOPER = 'developer',
    MANAGER = 'manager',
    VIEWER = 'viewer',
  }
  
  export interface User {
    id: number;
    username: string;
    email?: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string | null;
  }