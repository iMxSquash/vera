import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { Admin, JwtPayload } from './entities/admin.entity';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly supabaseService: SupabaseService
  ) {}

  async validateAdmin(email: string, password: string): Promise<Admin | null> {
    // Récupérer l'admin depuis Supabase
    const admin = await this.supabaseService.getAdminByEmail(email);

    if (!admin) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return null;
    }

    // Mapper les données Supabase vers l'entité Admin
    return {
      id: admin.id,
      email: admin.email,
      passwordHash: admin.password_hash,
      role: admin.role || 'admin',
      createdAt: new Date(admin.created_at),
      updatedAt: new Date(admin.updated_at),
    };
  }

  async login(
    loginDto: LoginDto
  ): Promise<{ accessToken: string; admin: Omit<Admin, 'passwordHash'> }> {
    const admin = await this.validateAdmin(loginDto.email, loginDto.password);

    if (!admin) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // Retourner l'admin sans le hash du mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...adminData } = admin;

    return {
      accessToken,
      admin: adminData,
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}
