import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  account: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ default: '' })
  description: string;

  @Prop({
    default: 'expense',
    enum: ['expense', 'income', 'transfer'],
    required: true,
  })
  type: 'expense' | 'income' | 'transfer';

  @Prop({
    type: String,
    default: null,
    required: function () {
      return this.type === 'transfer';
    },
  })
  relatedAccount?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  recurring: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Fast pagination + user filter
TransactionSchema.index({ user: 1, date: -1 });