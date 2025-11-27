import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { LoginRequest, LoginResponse, Admin } from '@vera/shared/models';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_API_KEY environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data: adminData, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('email', credentials.email)
      .single();

    if (error || !adminData) {
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, adminData.password_hash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    const admin: Admin = {
      id: adminData.id,
      email: adminData.email,
      role: adminData.role,
      createdAt: new Date(adminData.created_at),
      updatedAt: new Date(adminData.updated_at),
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
    const { data: adminData, error } = await this.supabase
      .from('admins')
      .select('id, email, role, created_at, updated_at')
      .eq('id', adminId)
      .single();

    if (error || !adminData) {
      throw new NotFoundException('Admin profile not found');
    }

    return {
      id: adminData.id,
      email: adminData.email,
      role: adminData.role,
      createdAt: new Date(adminData.created_at),
      updatedAt: new Date(adminData.updated_at),
    };
  }
}