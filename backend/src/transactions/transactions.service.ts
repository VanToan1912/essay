import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {}

  async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const created = new this.transactionModel({
      ...dto,
      user: new Types.ObjectId(userId),
      date: new Date(dto.date),
      type: dto.type || 'expense',
    });
    return created.save();
  }

  async findAll(userId: string): Promise<Transaction[]> {
    return this.transactionModel
      .find({ user: userId })
      .sort({ date: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<Transaction> {
    const trx = await this.transactionModel.findOne({ _id: id, user: userId });
    if (!trx) throw new NotFoundException('Transaction not found');
    return trx;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const updated = await this.transactionModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: dto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Transaction not found');
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.transactionModel.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0)
      throw new NotFoundException('Transaction not found');
  }

  async getSummary(userId: string) {
    const result = await this.transactionModel.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
    return result;
  }

  async getByCategory(userId: string) {
    return this.transactionModel.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  async filterByDate(userId: string, start: string, end: string) {
    return this.transactionModel
      .find({
        user: userId,
        date: { $gte: new Date(start), $lte: new Date(end) },
      })
      .sort({ date: -1 })
      .exec();
  }
}
