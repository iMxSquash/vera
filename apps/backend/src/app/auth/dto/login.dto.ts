import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "Email de l'administrateur",
    example: 'admin@vera.com',
    type: String,
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email est requis' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe (minimum 8 caractères)',
    example: 'SecureP@ss123',
    type: String,
    minLength: 8,
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Mot de passe est requis' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au minimum 8 caractères',
  })
  password: string;
}
