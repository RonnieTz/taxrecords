import dbConnect from '../../../lib/dbConnect';
import YearModel from '../../../models/YearModel';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const years = await YearModel.find({}).sort({ year: -1 });
    return NextResponse.json({ success: true, data: years });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const data = await request.json();
    const year = await YearModel.create(data);
    return NextResponse.json({ success: true, data: year }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
