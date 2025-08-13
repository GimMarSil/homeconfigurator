"use client";
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';

export default function ProjectsPage() {
  const { projects, currentOrganizationId } = useAppStore();
  const [q, setQ] = useState('');
  const list = useMemo(() => projects.filter(p => p.organizationId === currentOrganizationId && p.name.toLowerCase().includes(q.toLowerCase())), [projects, currentOrganizationId, q]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Projetos</h1>
        <Input placeholder="Procurar projeto" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
      </div>
      <div className="grid gap-2">
        {list.map(p => (
          <Link key={p.id} href={`/projetos/${p.id}`} className="rounded-lg border p-4 hover:bg-accent">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.client.name} • {p.type} • {p.scale}</div>
              </div>
              <div className="text-sm">Status: <span className="font-medium">{p.status}</span></div>
            </div>
          </Link>
        ))}
        {list.length === 0 ? <div className="text-sm text-muted-foreground">Sem projetos.</div> : null}
      </div>
    </div>
  );
}