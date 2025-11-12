import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Debt extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  creditor: string;

  @Prop({ type: Date, required: true })
  dueDate: Date;

  @Prop({ type: Date, default: Date.now })
  startDate: Date;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({
    default: 'unpaid',
    enum: ['unpaid', 'partial', 'paid'],
    required: true,
  })
  status: 'unpaid' | 'partial' | 'paid';

  @Prop()
  note?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const DebtSchema = SchemaFactory.createForClass(Debt);

// ---- validation: paidAmount <= amount ----
DebtSchema.pre<Debt>('save', function (next) {
  if (this.paidAmount > this.amount) {
    next(new Error('paidAmount cannot exceed total amount'));
  }
  // auto-update status
  if (this.paidAmount === 0) this.status = 'unpaid';
  else if (this.paidAmount >= this.amount) this.status = 'paid';
  else this.status = 'partial';
  next();
});

DebtSchema.virtual('remaining').get(function () {
  return this.amount - this.paidAmount;
});

DebtSchema.index({ user: 1, dueDate: 1 });