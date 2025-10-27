import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: { email: string; password: string; name: string }) {
    return this.authService.register(userData);
  }

  @Post('login')
  async login(@Body() credentials: { email: string; password: string }) {
    return this.authService.login(credentials);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: { email: string }) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() { token, newPassword }: { token: string; newPassword: string }) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}