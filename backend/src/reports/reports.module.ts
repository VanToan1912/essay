import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { Income, IncomeSchema } from '../incomes/schemas/income.schema';
import { Debt, DebtSchema } from '../debts/schemas/debt.schema';
import { Budget, BudgetSchema } from '../budgets/schemas/budget.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Income.name, schema: IncomeSchema },
      { name: Debt.name, schema: DebtSchema },
      { name: Budget.name, schema: BudgetSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
