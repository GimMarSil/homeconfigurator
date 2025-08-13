import { NextResponse } from 'next/server';

export async function GET() {
  const capacity = [
    { userId: 'u_pm1', capacity: 0.8, allocation: 0.6 },
    { userId: 'u_arq1', capacity: 0.9, allocation: 0.7 },
  ];
  return NextResponse.json({ capacity });
}