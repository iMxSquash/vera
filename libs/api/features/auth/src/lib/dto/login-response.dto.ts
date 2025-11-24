import { ApiProperty } from '@nestjs/swagger';
import { Admin } from '@vera/shared/models';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Admin user data',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@vera.app',
      role: 'admin',
      createdAt: '2025-11-24T10:00:00.000Z',
      updatedAt: '2025-11-24T10:00:00.000Z',
    },
  })
  admin!: Admin;
}

export class AdminDto {
  @ApiProperty({
    description: 'Admin ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({ description: 'Admin email', example: 'admin@vera.app' })
  email!: string;

  @ApiProperty({ description: 'Admin role', example: 'admin' })
  role!: string;
}
