export interface User {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive?: boolean;
    createdAt?: string;
  }
  
  export interface UserSummary {
    userId: number;
    firstName: string;
    lastName: string;
  }