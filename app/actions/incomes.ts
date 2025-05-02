'use server';

import dbConnect from '@/lib/dbConnect';
import IncomeModel from '@/models/IncomeModel';
import { getUserId } from '@/lib/auth';

export const getIncomes = async (year?: number) => {
  await dbConnect();
  const userId = await getUserId();
  console.log('Fetching incomes for user:', userId);

  const query = { user: userId };
  if (year !== undefined) {
    Object.assign(query, { year });
  }

  const incomes = await IncomeModel.find(query).sort({ date: -1 });
  if (!incomes) {
    return {
      success: false,
      message: 'No incomes found',
    };
  }
  return {
    success: true,
    data: incomes.map((income) => ({
      _id: income._id.toString(),
      description: income.description,
      amount: income.amount,
      date: income.date,
      category: income.category,
      user: income.user,
      taxDeductions: income.taxDeductions || 0,
      createdAt: income.createdAt,
      updatedAt: income.updatedAt,
    })),
  };
};

export const addIncome = async (
  description: string,
  amount: number,
  date: Date,
  category: string,
  year: number,
  taxDeductions: number = 0
) => {
  await dbConnect();
  const userId = await getUserId();
  console.log(
    'Adding income:',
    { description, amount, date, category, taxDeductions, year },
    'for user:',
    userId
  );

  const newIncome = new IncomeModel({
    user: userId,
    description,
    amount,
    date,
    category,
    year,
    taxDeductions,
  });
  await newIncome.save();
  return {
    success: true,
    data: {
      _id: newIncome._id.toString(),
      description: newIncome.description,
      amount: newIncome.amount,
      date: newIncome.date,
      category: newIncome.category,
      year: newIncome.year,
      taxDeductions: newIncome.taxDeductions || 0,
      user: newIncome.user,
      createdAt: newIncome.createdAt,
      updatedAt: newIncome.updatedAt,
    },
  };
};

export const deleteIncome = async (id: string) => {
  await dbConnect();
  const userId = await getUserId();
  console.log('Deleting income with ID:', id, 'for user:', userId);

  try {
    // Find the income and verify it belongs to the user before deleting
    const income = await IncomeModel.findOne({ _id: id, user: userId });

    if (!income) {
      return {
        success: false,
        message:
          'Income record not found or you do not have permission to delete it',
      };
    }

    // Delete the income
    const result = await IncomeModel.deleteOne({ _id: id, user: userId });

    if (result.deletedCount === 1) {
      return {
        success: true,
        message: 'Income record deleted successfully',
      };
    } else {
      return {
        success: false,
        message: 'Failed to delete income record',
      };
    }
  } catch (error) {
    console.error('Error deleting income:', error);
    return {
      success: false,
      message: 'An error occurred while deleting the income record',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
