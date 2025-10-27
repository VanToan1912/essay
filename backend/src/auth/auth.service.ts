import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(userData: { email: string; password: string; name: string }): Promise<User> {
    const { email, password, name } = userData;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = uuidv4();

    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      isVerified: false,
    });

    return user.save();
  }

  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: any }> {
    const { email, password } = credentials;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user.toObject();
    return { token, user: userWithoutPassword };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return { message: 'If email exists, reset link will be sent' };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // In production, send email with reset link
    console.log(`Reset token for ${email}: ${resetToken}`);

    return { message: 'If email exists, reset link will be sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ verificationToken: token });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }
}