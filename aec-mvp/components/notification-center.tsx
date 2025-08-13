"use client";
import { useAppStore } from '@/store/app-store';
import { Bell } from 'lucide-react';

export function NotificationCenter() {
  const { notifications, currentOrganizationId } = useAppStore();
  const list = notifications.filter(n => n.organizationId === currentOrganizationId).slice(0, 5);
  return (
    <div className="relative">
      <button className="p-2 rounded-md border hover:bg-accent" aria-label="notifications">
        <Bell className="h-4 w-4" />
      </button>
      <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover p-2 shadow-md">
        <div className="text-sm font-medium mb-2">Notificações</div>
        <div className="grid gap-1">
          {list.length === 0 ? <div className="text-sm text-muted-foreground p-2">Sem notificações</div> : null}
          {list.map(n => (
            <div key={n.id} className="rounded-md p-2 hover:bg-accent">
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(n.date).toLocaleString('pt-PT')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}