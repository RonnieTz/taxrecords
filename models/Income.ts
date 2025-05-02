import mongoose, { Schema, Document } from 'mongoose';

export interface IIncome extends Document {
  description: string;
  amount: number;
  date: Date;
  category: string;
  user: string; // Assuming you have a user field to associate with the income
  year: number; // Assuming you have a year field to associate with the income
  // Add additional fields as needed
}

const IncomeSchema: Schema = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    user: { type: String, required: true }, // Assuming you have a user field to associate with the income
    year: { type: Number, required: true }, // Assuming you have a year field to associate with the income
    // Add additional fields as needed
  },
  { timestamps: true }
);

export default mongoose.models.Income ||
  mongoose.model<IIncome>('Income', IncomeSchema);
