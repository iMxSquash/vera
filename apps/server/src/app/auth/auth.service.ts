import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
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

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const admin = await this.validateAdmin(loginDto.email, loginDto.password);

    if (!admin) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    // Retourner l'admin sans le hash du mot de passe
    const user = {
      id: admin.id,
      email: admin.email,
      fullname: admin.email.split('@')[0], // À améliorer si on a un champ fullname en DB
      created_at: admin.createdAt.toISOString(),
    };

    return {
      access_token,
      user,
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
