import { NextResponse } from 'next/server';

export async function GET() {
  const forecasting = {
    rolling12m: [120000, 140000, 160000, 130000, 150000, 170000, 165000, 180000, 175000, 190000, 200000, 210000],
    scenarios: {
      base: 1.0,
      optimistic: 1.15,
      pessimistic: 0.9,
    },
  };
  return NextResponse.json({ forecasting });
}