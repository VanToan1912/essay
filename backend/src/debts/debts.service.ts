import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Debt } from './schemas/debt.schema';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtsService {
  constructor(
    @InjectModel(Debt.name) private readonly debtModel: Model<Debt>,
  ) {}

  async create(userId: string, dto: CreateDebtDto): Promise<Debt> {
    const created = new this.debtModel({
      ...dto,
      user: new Types.ObjectId(userId),
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      dueDate: new Date(dto.dueDate),
      status: dto.status || 'unpaid',
      paidAmount: dto.paidAmount || 0,
    });
    return created.save();
  }

  async findAll(userId: string): Promise<Debt[]> {
    return this.debtModel.find({ user: userId }).sort({ dueDate: 1 }).exec();
  }

  async findOne(userId: string, id: string): Promise<Debt> {
    const debt = await this.debtModel.findOne({ _id: id, user: userId });
    if (!debt) throw new NotFoundException('Debt not found');
    return debt;
  }

  async update(userId: string, id: string, dto: UpdateDebtDto): Promise<Debt> {
    const updated = await this.debtModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: dto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Debt not found');
    return updated;
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.debtModel.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0)
      throw new NotFoundException('Debt not found');
  }

  async markAsPaid(userId: string, id: string): Promise<Debt> {
    const debt = await this.debtModel.findOneAndUpdate(
      { _id: id, user: userId },
      { status: 'paid', paidAmount: '$amount' },
      { new: true },
    );
    if (!debt) throw new NotFoundException('Debt not found');
    return debt;
  }

  async upcomingDebts(userId: string, days = 7): Promise<Debt[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    return this.debtModel
      .find({
        user: userId,
        dueDate: { $gte: now, $lte: future },
        status: { $ne: 'paid' },
      })
      .sort({ dueDate: 1 })
      .exec();
  }

  async getSummary(userId: string) {
    const result = await this.debtModel.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          totalPaid: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = { unpaid: 0, partial: 0, paid: 0 };
    result.forEach((r) => (summary[r._id] = r.totalAmount));
    return summary;
  }
}
