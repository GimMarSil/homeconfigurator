"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, BadgeDollarSign, BarChart3 } from 'lucide-react';

const navigationStructure = {
  dashboard: { label: 'Dashboard', href: '/' },
  projects: {
    label: 'Projetos',
    children: {
      list: { label: 'Todos os Projetos', href: '/projetos' },
      active: { label: 'Projetos Ativos', href: '/projetos/ativos' },
      pipeline: { label: 'Pipeline', href: '/projetos/pipeline' },
      archived: { label: 'Arquivados', href: '/projetos/arquivados' },
    },
  },
  clients: {
    label: 'Clientes',
    children: {
      list: { label: 'Todos os Clientes', href: '/clientes' },
      leads: { label: 'Leads', href: '/clientes/leads' },
      contracts: { label: 'Contratos', href: '/clientes/contratos' },
    },
  },
  resources: {
    label: 'Recursos',
    children: {
      team: { label: 'Equipa', href: '/recursos/equipa' },
      capacity: { label: 'Capacidade', href: '/recursos/capacidade' },
      equipment: { label: 'Equipamentos', href: '/recursos/equipamentos' },
    },
  },
  financials: {
    label: 'Financeiro',
    children: {
      overview: { label: 'Visão Geral', href: '/financeiro' },
      invoicing: { label: 'Faturação', href: '/financeiro/faturacao' },
      budgets: { label: 'Orçamentos', href: '/financeiro/orcamentos' },
      cashflow: { label: 'Cash Flow', href: '/financeiro/cashflow' },
    },
  },
  analytics: {
    label: 'Analytics',
    children: {
      performance: { label: 'Performance', href: '/analytics/performance' },
      profitability: { label: 'Rentabilidade', href: '/analytics/rentabilidade' },
      forecasting: { label: 'Previsões', href: '/analytics/previsoes' },
    },
  },
} as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-screen p-4 flex flex-col gap-6">
      <div className="px-2 py-3 rounded-md bg-card border">
        <div className="text-lg font-semibold">AEC Enterprise</div>
        <div className="text-xs text-muted-foreground">v0 MVP</div>
      </div>

      <nav className="space-y-6">
        <div>
          <SectionHeader icon={<LayoutDashboard className="h-4 w-4" />} label={navigationStructure.dashboard.label} />
          <NavItem href={navigationStructure.dashboard.href} active={pathname === navigationStructure.dashboard.href}>
            {navigationStructure.dashboard.label}
          </NavItem>
        </div>

        <Section icon={<FolderKanban className="h-4 w-4" />} label={navigationStructure.projects.label}>
          {Object.values(navigationStructure.projects.children).map((item) => (
            <NavItem key={item.href} href={item.href} active={pathname === item.href}>
              {item.label}
            </NavItem>
          ))}
        </Section>

        <Section icon={<Users className="h-4 w-4" />} label={navigationStructure.clients.label}>
          {Object.values(navigationStructure.clients.children).map((item) => (
            <NavItem key={item.href} href={item.href} active={pathname === item.href}>
              {item.label}
            </NavItem>
          ))}
        </Section>

        <Section icon={<BadgeDollarSign className="h-4 w-4" />} label={navigationStructure.financials.label}>
          {Object.values(navigationStructure.financials.children).map((item) => (
            <NavItem key={item.href} href={item.href} active={pathname === item.href}>
              {item.label}
            </NavItem>
          ))}
        </Section>

        <Section icon={<BarChart3 className="h-4 w-4" />} label={navigationStructure.analytics.label}>
          {Object.values(navigationStructure.analytics.children).map((item) => (
            <NavItem key={item.href} href={item.href} active={pathname === item.href}>
              {item.label}
            </NavItem>
          ))}
        </Section>
      </nav>
    </aside>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 mb-2">
      {icon}
      <span className="uppercase tracking-wide">{label}</span>
    </div>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionHeader icon={icon} label={label} />
      <div className="grid gap-1">{children}</div>
    </div>
  );
}

function NavItem({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm border ${active ? 'bg-accent' : 'hover:bg-accent'} transition`}
    >
      {children}
    </Link>
  );
}