import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Income } from './schemas/income.schema';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
  constructor(
    @InjectModel(Income.name) private readonly incomeModel: Model<Income>,
  ) {}

  async create(userId: string, dto: CreateIncomeDto): Promise<Income> {
    const created = new this.incomeModel({
      ...dto,
      user: new Types.ObjectId(userId),
      date: dto.date ? new Date(dto.date) : new Date(),
    });
    return created.save();
  }

  async findAll(userId: string): Promise<Income[]> {
    return this.incomeModel.find({ user: userId }).sort({ date: -1 }).exec();
  }

  async findOne(userId: string, id: string): Promise<Income> {
    const income = await this.incomeModel.findOne({ _id: id, user: userId });
    if (!income) throw new NotFoundException('Income not found');
    return income;
  }

  async update(userId: string, id: string, dto: UpdateIncomeDto): Promise<Income> {
    const updated = await this.incomeModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: dto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Income not found');
    return updated;
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.incomeModel.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0) throw new NotFoundException('Income not found');
  }

  async findByTag(userId: string, tag: string): Promise<Income[]> {
    return this.incomeModel.find({ user: userId, tags: tag }).exec();
  }

  async findBySource(userId: string, source: string): Promise<Income[]> {
    return this.incomeModel.find({ user: userId, source }).exec();
  }

  async getMonthlySummary(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return this.incomeModel.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$source',
          total: { $sum: '$amount' },
        },
      },
    ]);
  }
}
