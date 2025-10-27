import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '' })
  note?: string;

  @Prop({ default: false })
  recurring?: boolean;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
