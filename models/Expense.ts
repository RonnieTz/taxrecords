import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  amount: number;
  date: Date;
  category: string;
  user: string; // Reference to the User model
  // Add additional fields as needed
}

const ExpenseSchema: Schema = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Add additional fields as needed
  },
  { timestamps: true }
);

export default mongoose.models.Expense ||
  mongoose.model<IExpense>('Expense', ExpenseSchema);
