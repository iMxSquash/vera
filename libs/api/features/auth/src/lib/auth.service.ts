import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginRequest, LoginResponse, Admin } from '@vera/shared/models';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Validate credentials with Supabase
    // This is a placeholder - implement with actual Supabase auth
    const admin: Admin = {
      id: '1',
      email: credentials.email,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const accessToken = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return {
      accessToken,
      admin,
    };
  }

  async getProfile(adminId: string): Promise<Admin> {
    // Fetch admin profile from Supabase
    // Placeholder implementation
    return {
      id: adminId,
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
