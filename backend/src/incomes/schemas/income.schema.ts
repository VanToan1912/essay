import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Income extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  source: string; // e.g., 'Salary', 'Freelance', 'Investment'

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  note?: string;

  @Prop({ default: false })
  recurring?: boolean;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);
