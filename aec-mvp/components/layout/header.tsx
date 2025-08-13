"use client";
import { Building2, Plus, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { OrganizationSwitcher } from '@/components/organization-switcher';
import { NotificationCenter } from '@/components/notification-center';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Header() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="h-16 px-4 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6" />
        <OrganizationSwitcher />
      </div>
      <nav className="text-sm text-muted-foreground">Home / Dashboard</nav>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Input placeholder="Pesquisa global" className="pl-9 w-72" />
          <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button variant="outline" size="icon" aria-label="quick-new"><Plus className="h-4 w-4" /></Button>
        <NotificationCenter />
        <Button variant="outline" size="icon" aria-label="toggle-theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600" />
      </div>
    </header>
  );
}