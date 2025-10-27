import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsDateString,
    IsArray,
    IsIn,
  } from 'class-validator';
  
  export class CreateDebtDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsNumber()
    amount: number;
  
    @IsString()
    @IsNotEmpty()
    creditor: string;
  
    @IsDateString()
    dueDate: string;
  
    @IsOptional()
    @IsDateString()
    startDate?: string;
  
    @IsOptional()
    @IsNumber()
    paidAmount?: number;
  
    @IsOptional()
    @IsIn(['unpaid', 'partial', 'paid'])
    status?: string;
  
    @IsOptional()
    @IsString()
    note?: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
  }
  