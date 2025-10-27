import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { Income } from '../incomes/schemas/income.schema';
import { Debt } from '../debts/schemas/debt.schema';
import { Budget } from '../budgets/schemas/budget.schema';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Income.name)
    private readonly incomeModel: Model<Income>,
    @InjectModel(Debt.name)
    private readonly debtModel: Model<Debt>,
    @InjectModel(Budget.name)
    private readonly budgetModel: Model<Budget>,
  ) {}

  private getDateRange(dto: ReportQueryDto) {
    const now = new Date();
    let start: Date, end: Date;
  
    switch (dto.type) {
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
  
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
  
      case 'custom':
        if (!dto.startDate || !dto.endDate) {
          throw new Error('startDate and endDate are required for custom report type');
        }
  
        start = new Date(dto.startDate);
        end = new Date(dto.endDate);
  
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format for startDate or endDate');
        }
  
        // Ensure start <= end
        if (start > end) {
          [start, end] = [end, start];
        }
        break;
  
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
  
    // Normalize to cover full days
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  
    return { start, end };
  }
  

  async getOverview(userId: string, dto: ReportQueryDto) {
    const { start, end } = this.getDateRange(dto);

    const [transactions, incomes, debts] = await Promise.all([
      this.transactionModel
        .find({ user: userId, date: { $gte: start, $lte: end } })
        .exec(),
      this.incomeModel
        .find({ user: userId, date: { $gte: start, $lte: end } })
        .exec(),
      this.debtModel.find({ user: userId }).exec(),
    ]);

    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalDebts = debts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
    const balance = totalIncome - totalExpenses;

    return {
      range: { start, end },
      totalIncome,
      totalExpenses,
      totalDebts,
      balance,
    };
  }

  async categoryBreakdown(userId: string, dto: ReportQueryDto) {
    const { start, end } = this.getDateRange(dto);

    return this.transactionModel.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);
  }

  async incomeVsExpenseTrend(userId: string, months = 6) {
    const now = new Date();
    const past = new Date();
    past.setMonth(now.getMonth() - months);

    const [incomeData, expenseData] = await Promise.all([
      this.incomeModel.aggregate([
        {
          $match: {
            user: new Types.ObjectId(userId),
            date: { $gte: past, $lte: now },
          },
        },
        {
          $group: {
            _id: { $month: '$date' },
            totalIncome: { $sum: '$amount' },
          },
        },
      ]),
      this.transactionModel.aggregate([
        {
          $match: {
            user: new Types.ObjectId(userId),
            date: { $gte: past, $lte: now },
          },
        },
        {
          $group: {
            _id: { $month: '$date' },
            totalExpense: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    return { incomeData, expenseData };
  }

  async budgetPerformance(userId: string, dto: ReportQueryDto) {
    const { start, end } = this.getDateRange(dto);

    return this.budgetModel.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'transactions',
          localField: 'category',
          foreignField: 'category',
          as: 'transactions',
        },
      },
      {
        $project: {
          category: 1,
          limit: 1,
          spent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$transactions',
                    as: 't',
                    cond: {
                      $and: [
                        { $gte: ['$$t.date', start] },
                        { $lte: ['$$t.date', end] },
                      ],
                    },
                  },
                },
                as: 'filtered',
                in: '$$filtered.amount',
              },
            },
          },
        },
      },
      {
        $addFields: {
          remaining: { $subtract: ['$limit', '$spent'] },
          usedPercent: {
            $cond: [
              { $eq: ['$limit', 0] },
              0,
              { $multiply: [{ $divide: ['$spent', '$limit'] }, 100] },
            ],
          },
        },
      },
    ]);
  }
}
