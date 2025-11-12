import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Budget extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;

  @Prop({ enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  period?: string;

  @Prop({ default: 0 })
  spent: number;

  @Prop({ default: 0 })
  savingGoal?: number;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);

// Prevent duplicate budgets for the same user/category/period
BudgetSchema.index(
  { user: 1, category: 1, period: 1 },
  { unique: true, partialFilterExpression: { period: { $exists: true } } },
);

BudgetSchema.virtual('progress').get(function () {
  return this.amount ? (this.spent / this.amount) * 100 : 0;
});