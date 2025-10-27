import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Budget extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;

  @Prop()
  period?: string; // e.g. 'monthly', 'weekly', 'yearly'

  @Prop({ default: 0 })
  spent: number;

  @Prop({ default: 0 })
  savingGoal?: number;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
