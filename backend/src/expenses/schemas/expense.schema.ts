import {
  Prop,
  Schema,
  SchemaFactory,
  raw,
} from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    min: [0, 'Amount cannot be negative'],
  })
  amount: number;

  @Prop({
    required: true,
    trim: true,
    // Example categories – feel free to replace with a separate Category collection
    enum: {
      values: [
        'Food',
        'Transport',
        'Entertainment',
        'Shopping',
        'Health',
        'Education',
        'Rent',
        'Utilities',
        'Other',
      ],
      message: '{VALUE} is not a valid category',
    },
  })
  category: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '' })
  note?: string;

  @Prop({ default: false })
  recurring: boolean;
}

/* -------------------------------------------------------------------------- */
/*                               SCHEMA & HOOKS                               */
/* -------------------------------------------------------------------------- */
export const ExpenseSchema = SchemaFactory.createForClass(Expense);

/* ---- 1. Basic cleanup & validation ---- */
ExpenseSchema.pre<Expense>('save', function (next) {
  // Trim strings
  this.name = this.name.trim();
  if (this.note) this.note = this.note.trim();

  // Ensure amount is not negative (Mongoose min validator already does it,
  // but we keep it here for explicitness)
  if (this.amount < 0) {
    return next(new Error('Amount cannot be negative'));
  }

  next();
});

/* ---- 2. Indexes for common queries ---- */
// 2-a) User + date descending → pagination / monthly reports
ExpenseSchema.index({ user: 1, date: -1 });

// 2-b) Category filter (optional but very handy)
ExpenseSchema.index({ user: 1, category: 1 });

// 2-c) TTL – delete expenses older than 7 years (adjust as needed)
ExpenseSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 365 * 7, // 7 years
    partialFilterExpression: { recurring: false }, // keep recurring ones forever
  },
);

/* ---- 3. Virtuals ---- */
// Useful when you join with Budget to show how much of the budget is left
ExpenseSchema.virtual('remaining').get(function (this: Expense) {
  // Placeholder – real logic would be in an aggregation pipeline
  return this.amount;
});