import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IncomesController } from './incomes.controller';
import { IncomesService } from './incomes.service';
import { Income, IncomeSchema } from './schemas/income.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }])],
  controllers: [IncomesController],
  providers: [IncomesService],
  exports: [IncomesService],
})
export class IncomesModule {}
