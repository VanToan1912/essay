import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  category: string; // e.g., "Food", "Rent", "Travel"

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  account: string; // e.g., "Main Wallet", "Bank Account"

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'expense', enum: ['expense', 'income', 'transfer'] })
  type: string;

  @Prop({ type: String, default: null })
  relatedAccount?: string; // for transfers

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  recurring: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
