"use client";
import { useAppStore } from '@/store/app-store';
import { ChevronDown } from 'lucide-react';

export function OrganizationSwitcher() {
  const { organizations, currentOrganizationId, switchOrganization } = useAppStore();
  const current = organizations.find(o => o.id === currentOrganizationId) ?? organizations[0];
  return (
    <div className="relative inline-block">
      <button className="inline-flex items-center gap-1 text-sm font-medium">
        <span>{current?.name ?? 'Organização'}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="absolute mt-2 w-64 rounded-md border bg-popover p-1 shadow-md z-20 hidden group-hover:block" />
      <div className="absolute mt-2 w-64 rounded-md border bg-popover p-1 shadow-md z-20">
        {organizations.map(org => (
          <button key={org.id} onClick={() => switchOrganization(org.id)} className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent ${org.id === currentOrganizationId ? 'bg-accent' : ''}`}>
            {org.name}
          </button>
        ))}
      </div>
    </div>
  );
}