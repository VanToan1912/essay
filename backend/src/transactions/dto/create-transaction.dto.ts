import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsDateString,
    IsOptional,
    IsIn,
    IsArray,
  } from 'class-validator';
  
  export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    category: string;
  
    @IsNumber()
    amount: number;
  
    @IsString()
    @IsNotEmpty()
    account: string;
  
    @IsDateString()
    date: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsIn(['expense', 'income', 'transfer'])
    type?: string;
  
    @IsOptional()
    @IsString()
    relatedAccount?: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
  
    @IsOptional()
    recurring?: boolean;
  }
  