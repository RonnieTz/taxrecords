import mongoose, { Schema, Document } from 'mongoose';

export interface IIncome extends Document {
  description: string;
  amount: number;
  date: Date;
  category: string;
  // Add additional fields as needed
}

const IncomeSchema: Schema = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    // Add additional fields as needed
  },
  { timestamps: true }
);

export default mongoose.models.Income ||
  mongoose.model<IIncome>('Income', IncomeSchema);
