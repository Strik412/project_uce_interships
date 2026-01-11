import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '@app/shared';
import {
  LoginCredentials,
  AuthResponse,
  UserProfile,
  JwtPayload,
} from '@shared/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email and password',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        isActive: { type: 'boolean' },
      },
    },
  })
  async register(
    @Body() body: { email: string; password: string; firstName: string; lastName: string; role?: string },
  ): Promise<UserProfile> {
    return this.authService.register(body.email, body.password, body.firstName, body.lastName, body.role);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        user: { type: 'object' },
      },
    },
  })
  async login(@Body() credentials: LoginCredentials): Promise<AuthResponse> {
    return this.authService.login(credentials);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        user: { type: 'object' },
      },
    },
  })
  async refresh(@Body() body: { refreshToken: string }): Promise<AuthResponse> {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Get('verify')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify token',
    description: 'Verify the validity of the current access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    type: Object,
  })
  async verifyToken(@Request() req: any): Promise<JwtPayload> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }
    const token = authHeader.substring(7);
    return this.authService.validateToken(token);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset token to email',
  })
  async forgotPassword(@Body() body: { email: string }): Promise<{ message: string }> {
    await this.authService.generatePasswordResetToken(body.email);
    return { message: 'Password reset token sent to email' };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password with token from email',
  })
  async resetPassword(
    @Body() body: { token: string; newPassword: string },
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(body.token, body.newPassword);
    return { message: 'Password reset successfully' };
  }
}
