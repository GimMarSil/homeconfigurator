import { NextResponse } from 'next/server';
import { projects } from '@/data/mock';

export async function GET() {
  return NextResponse.json({ projects });
}