import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsNumber()
  savingGoal?: number;
}
