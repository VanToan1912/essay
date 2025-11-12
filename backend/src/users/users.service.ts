// src/user/user.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private toUserResponse(user: any): UserResponseDto {
    return new UserResponseDto({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ 
      email: createUserDto.email.toLowerCase() 
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      password: hashedPassword,
    });

    const savedUser = await user.save();
    return this.toUserResponse(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userModel
      .find()
      .select('-password -resetPasswordToken -verificationToken')
      .sort({ createdAt: -1 })
      .exec();
    
    return users.map(user => this.toUserResponse(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userModel
      .findById(id)
      .select('-password -resetPasswordToken -verificationToken')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if email is being updated and if it's already taken
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email.toLowerCase(),
        _id: { $ne: id }
      });

      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
      updateUserDto.email = updateUserDto.email.toLowerCase();
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateUserDto, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .select('-password -resetPasswordToken -verificationToken')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    ).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      )
      .select('-password -resetPasswordToken -verificationToken')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async activate(id: string): Promise<UserResponseDto> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { isActive: true, updatedAt: new Date() },
        { new: true }
      )
      .select('-password -resetPasswordToken -verificationToken')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { 
      lastLogin: new Date() 
    }).exec();
  }

  async getProfile(id: string): Promise<UserResponseDto> {
    return this.findOne(id);
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Remove role from update if present (users shouldn't be able to change their own role)
    const { role, ...profileData } = updateUserDto;
    return this.update(id, profileData);
  }
}