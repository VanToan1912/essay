import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Debt extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string; // e.g., "Car Loan", "Friend Borrow"

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  creditor: string; // who lent or borrowed (could be person or institution)

  @Prop({ type: Date, required: true })
  dueDate: Date;

  @Prop({ type: Date, default: Date.now })
  startDate: Date;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ default: 'unpaid', enum: ['unpaid', 'partial', 'paid'] })
  status: string;

  @Prop()
  note?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const DebtSchema = SchemaFactory.createForClass(Debt);
