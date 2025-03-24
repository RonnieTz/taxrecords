import dbConnect from '../../../lib/dbConnect';
import ExpenseModel from '../../../models/ExpenseModel';
import { NextResponse, NextRequest } from 'next/server';

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

    const expenses = await ExpenseModel.find({ year }).sort({ date: -1 });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
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
    const expense = await ExpenseModel.create(data);
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
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
  console.log(request);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID parameter is required' },
        { status: 400 }
      );
    }

    const expense = await ExpenseModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
