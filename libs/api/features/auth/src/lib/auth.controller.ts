import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse, Admin } from '@vera/shared/models';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponse,
  })
  async login(@Body() credentials: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(credentials);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile', type: Admin })
  async getProfile(@Req() req: Request): Promise<Admin> {
    const user = req.user as any;
    return {
      id: user.userId,
      email: user.email,
      role: user.role,
      createdAt: new Date(), // Placeholder, could be stored in DB later
      updatedAt: new Date(),
    };
  }
}
