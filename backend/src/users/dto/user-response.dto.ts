export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}