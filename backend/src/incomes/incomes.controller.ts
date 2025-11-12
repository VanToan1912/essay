// src/income/income.controller.ts
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { IncomeService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('income')
@UseGuards(JwtAuthGuard)
export class IncomeController {
  constructor(private incomeService: IncomeService) {}

  @Post()
  create(@Body() dto: CreateIncomeDto, @Request() req) {
    return this.incomeService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.incomeService.findAll(req.user.userId);
  }
}