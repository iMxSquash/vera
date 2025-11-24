import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, AdminDto } from './dto/login-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion administrateur',
    description:
      'Authentifie un administrateur avec email et mot de passe. Retourne un token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides (email ou mot de passe incorrect)',
  })
  @ApiResponse({
    status: 400,
    description: 'Données de requête invalides',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Récupérer le profil admin',
    description:
      "Récupère les informations du profil de l'administrateur connecté.",
  })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré avec succès',
    type: AdminDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié ou token expiré. Veuillez vous reconnecter.',
  })
  async getProfile(@Request() req): Promise<AdminDto> {
    return req.user;
  }
}
