import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
  ) {}

  async create(userId: string, dto: CreateExpenseDto): Promise<Expense> {
    const created = new this.expenseModel({
      ...dto,
      user: new Types.ObjectId(userId),
      date: dto.date ? new Date(dto.date) : new Date(),
    });
    return created.save();
  }

  async findAll(userId: string): Promise<Expense[]> {
    return this.expenseModel
      .find({ user: userId })
      .sort({ date: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<Expense> {
    const expense = await this.expenseModel.findOne({ _id: id, user: userId });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const updated = await this.expenseModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: dto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Expense not found');
    return updated;
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.expenseModel.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0) throw new NotFoundException('Expense not found');
  }

  async findByTag(userId: string, tag: string): Promise<Expense[]> {
    return this.expenseModel.find({ user: userId, tags: tag }).exec();
  }

  async viewHistory(userId: string, limit = 10): Promise<Expense[]> {
    return this.expenseModel
      .find({ user: userId })
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }
}
