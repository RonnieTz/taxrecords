'use server';

import dbConnect from '@/lib/dbConnect';
import ExpenseModel from '@/models/ExpenseModel';
import { getUserId } from '@/lib/auth';

export const getExpenses = async (year: number) => {
  await dbConnect();
  const userId = await getUserId();
  console.log('Fetching expenses for user:', userId, 'year:', year);

  const expenses = await ExpenseModel.find({ user: userId, year }).sort({
    date: -1,
  });
  if (!expenses) {
    return {
      success: false,
      message: 'No expenses found',
    };
  }
  return {
    success: true,
    data: expenses.map((expense) => ({
      _id: expense._id.toString(),
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      user: expense.user,
    })),
  };
};

export const addExpense = async (
  description: string,
  amount: number,
  date: Date,
  category: string,
  year: number
) => {
  await dbConnect();
  const userId = await getUserId();
  console.log(
    'Adding expense:',
    { description, amount, date, category, year },
    'for user:',
    userId
  );

  const newExpense = new ExpenseModel({
    user: userId,
    description,
    amount,
    date,
    category,
    year,
  });
  await newExpense.save();
  return {
    success: true,
    data: {
      _id: newExpense._id.toString(),
      description: newExpense.description,
      amount: newExpense.amount,
      date: newExpense.date,
      category: newExpense.category,
      year: newExpense.year,
      user: newExpense.user,
      createdAt: newExpense.createdAt,
      updatedAt: newExpense.updatedAt,
    },
  };
};

export const deleteExpense = async (id: string) => {
  await dbConnect();
  const userId = await getUserId();
  console.log('Deleting expense with ID:', id, 'for user:', userId);

  try {
    // Find the expense and verify it belongs to the user before deleting
    const expense = await ExpenseModel.findOne({ _id: id, user: userId });

    if (!expense) {
      return {
        success: false,
        message:
          'Expense record not found or you do not have permission to delete it',
      };
    }

    // Delete the expense
    const result = await ExpenseModel.deleteOne({ _id: id, user: userId });

    if (result.deletedCount === 1) {
      return {
        success: true,
        message: 'Expense record deleted successfully',
      };
    } else {
      return {
        success: false,
        message: 'Failed to delete expense record',
      };
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    return {
      success: false,
      message: 'An error occurred while deleting the expense record',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
