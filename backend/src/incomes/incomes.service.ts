// src/income/income.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Income } from './schemas/income.schema';
import { Model } from 'mongoose';
import { CreateIncomeDto } from './dto/create-income.dto';

@Injectable()
export class IncomeService {
  constructor(@InjectModel(Income.name) private incomeModel: Model<Income>) {}

  async create(dto: CreateIncomeDto, userId: string) {
    const income = new this.incomeModel({
      ...dto,
      user: userId,
    });
    return income.save();
  }

  async findAll(userId: string) {
    return this.incomeModel.find({ user: userId }).sort({ date: -1 }).exec();
  }
}