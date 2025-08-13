"use client";
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { users, loginAs } = useAppStore();
  return (
    <div className="max-w-xl mx-auto mt-16 space-y-4">
      <h1 className="text-2xl font-bold">Escolher Utilizador</h1>
      <div className="grid gap-2">
        {users.map(u => (
          <Button key={u.id} variant="outline" className="justify-start" onClick={() => loginAs(u.id)}>
            <span className="font-medium mr-2">{u.name}</span>
            <span className="text-xs text-muted-foreground">({u.role})</span>
          </Button>
        ))}
      </div>
    </div>
  );
}