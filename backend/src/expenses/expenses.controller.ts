// src/expense/expense.controller.ts
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ExpenseService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expense')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto, @Request() req) {
    return this.expenseService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.expenseService.findAll(req.user.userId);
  }
}