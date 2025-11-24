export interface Admin {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  accessToken: string;
  admin: Admin;
}

export interface LoginRequest {
  email: string;
  password: string;
}
