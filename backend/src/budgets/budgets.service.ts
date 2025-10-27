import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Budget } from './schemas/budget.schema';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
  ) {}

  async create(userId: string, dto: CreateBudgetDto): Promise<Budget> {
    const created = new this.budgetModel({
      ...dto,
      user: new Types.ObjectId(userId),
    });
    return created.save();
  }

  async findAll(userId: string): Promise<Budget[]> {
    return this.budgetModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(userId: string, id: string): Promise<Budget> {
    const budget = await this.budgetModel.findOne({ _id: id, user: userId });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto): Promise<Budget> {
    const updated = await this.budgetModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: dto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Budget not found');
    return updated;
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.budgetModel.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0) throw new NotFoundException('Budget not found');
  }

  async trackBudgets(userId: string) {
    return this.budgetModel.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          spent: { $sum: '$spent' },
        },
      },
    ]);
  }
}
