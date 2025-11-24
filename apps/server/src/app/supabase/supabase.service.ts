import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_API_KEY');

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Méthodes utilitaires pour l'authentification
  async getAdminByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async createAdmin(admin: {
    email: string;
    passwordHash: string;
    role: string;
  }) {
    const { data, error } = await this.supabase
      .from('admins')
      .insert([admin])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }

    return data;
  }
}
