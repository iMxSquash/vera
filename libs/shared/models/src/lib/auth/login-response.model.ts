import { Admin } from './admin.model';

/**
 * Login response DTO - shared between frontend and backend
 */
export class LoginResponse {
  accessToken!: string;
  admin!: Admin;
}
