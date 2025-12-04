import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  apiUrl: string;
  serverUrl: string;
  clientUrl?: string;
  frontendUrl?: string;
  supabaseUrl: string;
  supabaseApiKey: string;
  tokenKey: string;
  veraApiUrl?: string;
  veraApiKey?: string;
  directUrl?: string;
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment');
