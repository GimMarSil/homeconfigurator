"use client";
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';
import { useMemo } from 'react';

const projectTabs = {
  overview: 'Visão Geral',
  phases: 'Fases e Entregas',
  team: 'Equipa e Recursos',
  timeline: 'Cronograma',
  budget: 'Orçamento e Financeiro',
  documents: 'Documentação',
  risks: 'Riscos e Issues',
  communications: 'Comunicações',
  approvals: 'Aprovações',
  analytics: 'Analytics',
} as const;

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { projects } = useAppStore();
  const project = useMemo(() => projects.find(p => p.id === params.id), [projects, params.id]);
  if (!project) return <div className="space-y-4"><Link href="/projetos" className="underline text-sm">Voltar</Link><div>Projeto não encontrado.</div></div>;

  const health = computeHealth(project.budget.spent, project.budget.forecasted, project.budget.total);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Link href="/projetos" className="text-sm text-muted-foreground underline">Voltar</Link>
      </div>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(projectTabs).map(([key, label]) => (
          <button key={key} className="px-3 py-1.5 rounded-md border text-sm hover:bg-accent">{label}</button>
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Health" value={health} />
        <Kpi title="Budget vs Spent" value={`${formatCurrency(project.budget.spent)} / ${formatCurrency(project.budget.total)}`} />
        <Kpi title="Forecasted" value={formatCurrency(project.budget.forecasted)} />
        <Kpi title="Risks" value={`${project.risks.length}`} />
      </div>
      <div className="rounded-lg border p-4 h-80">Timeline / Gantt (placeholder)</div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function computeHealth(spent: number, forecasted: number, total: number): string {
  const ratio = forecasted / total;
  if (ratio <= 1.0) return 'Green';
  if (ratio <= 1.1) return 'Yellow';
  return 'Red';
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
}