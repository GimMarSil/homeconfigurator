import { NextResponse } from 'next/server';
import { invoices, projects } from '@/data/mock';

export async function GET() {
  const revenueMonth = invoices.reduce((sum, i) => sum + (i.status !== 'draft' ? i.amount : 0), 0);
  const utilization = 0.76;
  const projectsAtRisk = projects.filter(p => p.risks.some(r => r.riskScore >= 12)).length;
  const cashflow6m = 640000;
  return NextResponse.json({ revenueMonth, utilization, projectsAtRisk, cashflow6m });
}