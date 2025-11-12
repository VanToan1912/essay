// src/expense/expense.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Expense } from './schemas/expense.schema';
import { Model } from 'mongoose';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(@InjectModel(Expense.name) private expenseModel: Model<Expense>) {}

  async create(dto: CreateExpenseDto, userId: string) {
    const expense = new this.expenseModel({
      ...dto,
      user: userId,
    });
    return expense.save();
  }

  async findAll(userId: string) {
    return this.expenseModel.find({ user: userId }).sort({ date: -1 }).exec();
  }
}