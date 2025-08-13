"use client";
import { useAppStore } from '@/store/app-store';

export default function ClientsPage() {
  const { clients } = useAppStore();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Clientes</h1>
      <div className="grid gap-2">
        {clients.map(c => (
          <div key={c.id} className="rounded-lg border p-4">
            <div className="font-medium">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.type} • {c.tier} • Projetos: {c.projects.active}/{c.projects.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}