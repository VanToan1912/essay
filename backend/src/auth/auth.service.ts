import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { User } from '../users/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) { }

  async register(userData: { email: string; password: string; name: string }): Promise<User> {
    const { email, password, name } = userData;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate random 6-digit verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      isVerified: false,
    });

    const savedUser = await user.save();

    // Send verification email
    await this.sendVerificationEmail(email, verificationToken);

    return savedUser;
  }

  private async sendVerificationEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: '"Easy Budget" <no-reply@myapp.com>',
      to: email,
      subject: 'Verify your email address',
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is: <b>${code}</b></p>`,
    };

    await transporter.sendMail(mailOptions);
  }

  async verifyEmail(email: string, code: string) {
    if (!email || !code) {
      throw new BadRequestException('Missing email or verification code');
    }
  
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }
  
    if (user.verificationToken !== code) {
      throw new BadRequestException('Invalid verification code');
    }
  
    user.isVerified = true;
    user.verificationToken = "";
    await user.save();
  
    return { message: 'Email verified successfully' };
  }
  

  async login(credentials: { email: string; password: string }) {
    const { email, password } = credentials;
  
    const user = await this.userModel.findOne({ email }).select('+password').lean();
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }
  
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
    };
  
    return {
      token: this.jwtService.sign(payload),
      user: (({ password, ...u }) => u)(user),
    };
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
}