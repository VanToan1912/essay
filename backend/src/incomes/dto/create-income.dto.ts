// src/income/dto/create-income.dto.ts
import { IsString, IsNumber, IsOptional, IsBoolean, IsDate, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIncomeDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  source: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean = false;
}