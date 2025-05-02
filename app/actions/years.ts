'use server';

import dbConnect from '@/lib/dbConnect';
import YearModel from '@/models/YearModel';
import { getUserId } from '@/lib/auth';

export const getYears = async () => {
  await dbConnect();
  const userId = await getUserId();
  console.log('Fetching years for user:', userId);

  const years = await YearModel.find({ user: userId }).sort({ year: -1 });
  if (!years) {
    return {
      success: false,
      message: 'No years found',
    };
  }
  return {
    success: true,
    data: years.map((year) => ({
      _id: year._id.toString(),
      year: year.year,
      user: year.user,
      createdAt: year.createdAt,
      updatedAt: year.updatedAt,
    })),
  };
};

export const addYear = async (year: number) => {
  await dbConnect();
  const userId = await getUserId();
  console.log('Adding year:', year, 'for user:', userId);

  const existingYear = await YearModel.findOne({ user: userId, year });
  if (existingYear) {
    console.log('Year already exists:', existingYear);
    return {
      success: false,
      message: 'Year already exists',
    };
  }
  const newYear = new YearModel({ user: userId, year });
  await newYear.save();
  return {
    success: true,
    data: {
      _id: newYear._id.toString(),
      year: newYear.year,
      user: newYear.user,
      createdAt: newYear.createdAt,
      updatedAt: newYear.updatedAt,
    },
  };
};
