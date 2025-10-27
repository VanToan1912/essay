import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsArray,
    IsDateString,
  } from 'class-validator';
  
  export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsNumber()
    amount: number;
  
    @IsString()
    @IsNotEmpty()
    category: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
  
    @IsOptional()
    @IsString()
    note?: string;
  
    @IsOptional()
    @IsBoolean()
    recurring?: boolean;
  
    @IsOptional()
    @IsDateString()
    date?: string;
  }
  