// src/user/user.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles('admin')
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get('profile')
  async getProfile(@Param('userId') userId: string): Promise<UserResponseDto> {
    // In a real app, you'd get userId from the JWT token
    return this.userService.getProfile(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch('profile')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.userService.updateProfile(userId, updateUserDto);
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.remove(id);
  }

  @Patch(':id/deactivate')
  @Roles('admin')
  async deactivate(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles('admin')
  async activate(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.activate(id);
  }
}