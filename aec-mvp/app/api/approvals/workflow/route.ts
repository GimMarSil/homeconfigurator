import { NextResponse } from 'next/server';

export async function GET() {
  const workflows = [
    {
      id: 'wf1',
      name: 'Aprovação de Fase',
      steps: [
        { id: 's1', name: 'PM Approval', approvers: ['u_pm1'], requiredApprovals: 1, sla: 24 },
        { id: 's2', name: 'Admin Approval', approvers: ['u_admin'], requiredApprovals: 1, sla: 24 },
      ],
    },
  ];
  return NextResponse.json({ workflows });
}