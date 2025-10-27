import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ExpensesModule } from './expenses/expenses.module';
import { IncomesModule } from './incomes/incomes.module';
import { DebtsModule } from './debts/debts.module';
import { ReportsModule } from './reports/reports.module';
// import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/easy_budget'),
    AuthModule,
        UserModule,
        BudgetsModule,
        ExpensesModule,
        IncomesModule,
        DebtsModule,
        ReportsModule,
  ],
})
export class AppModule {}