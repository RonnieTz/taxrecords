import dbConnect from '../../../lib/dbConnect';
import IncomeModel from '../../../models/IncomeModel';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    if (!year) {
      return NextResponse.json(
        { success: false, message: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const incomes = await IncomeModel.find({ year }).sort({ date: -1 });
    return NextResponse.json({ success: true, data: incomes });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const data = await request.json();
    const income = await IncomeModel.create(data);
    return NextResponse.json({ success: true, data: income }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID parameter is required' },
        { status: 400 }
      );
    }

    const income = await IncomeModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: income });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
