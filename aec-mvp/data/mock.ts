import { Client, Department, InvoiceEnterprise, Organization, ProjectEnterprise, ProjectPhase, Role, User, NotificationItem, Permission } from '@/types/enterprise';

function iso(date: string) { return new Date(date).toISOString(); }

export const organizations: Organization[] = [
  {
    id: 'org_arqpro',
    name: 'ARQPRO Arquitectos',
    type: 'architecture',
    size: 'large',
    departments: [
      { id: 'd_arq', name: 'Arquitetura', managerId: 'u_dir1', costCenter: 'CC-ARQ', budget: 500000 },
      { id: 'd_gest', name: 'Gestão', managerId: 'u_pm1', costCenter: 'CC-GEST', budget: 200000 }
    ],
    settings: { theme: 'system' }
  },
  {
    id: 'org_engmod',
    name: 'Engenharia Moderna Lda',
    type: 'engineering',
    size: 'medium',
    departments: [
      { id: 'd_civil', name: 'Engenharia Civil', managerId: 'u_dir2', costCenter: 'CC-CIV', budget: 350000 },
    ],
    settings: { theme: 'system' }
  },
  {
    id: 'org_silva',
    name: 'Gabinete Silva & Associados',
    type: 'mixed',
    size: 'small',
    departments: [
      { id: 'd_misto', name: 'Misto', managerId: 'u_pm3', costCenter: 'CC-MIX', budget: 150000 },
    ],
    settings: { theme: 'system' }
  },
];

const basePermissions = (role: Role): Permission[] => {
  switch (role) {
    case 'admin':
      return [
        { resource: 'projects', actions: ['create','read','update','delete','approve'] },
        { resource: 'clients', actions: ['create','read','update','delete'] },
        { resource: 'financials', actions: ['read','update','approve'] },
        { resource: 'reports', actions: ['read'] },
        { resource: 'admin', actions: ['read','update'] },
      ];
    case 'project_manager':
      return [
        { resource: 'projects', actions: ['create','read','update','approve'] },
        { resource: 'clients', actions: ['read','update'] },
        { resource: 'financials', actions: ['read','update'] },
        { resource: 'reports', actions: ['read'] },
      ];
    case 'architect':
    case 'engineer':
    case 'junior':
      return [
        { resource: 'projects', actions: ['read','update'] },
        { resource: 'clients', actions: ['read'] },
        { resource: 'reports', actions: ['read'] },
      ];
    case 'client_viewer':
      return [ { resource: 'projects', actions: ['read'] }, { resource: 'reports', actions: ['read'] } ];
  }
};

export const users: User[] = [
  { id: 'u_admin', name: 'Ana Admin', email: 'ana@arqpro.pt', role: 'admin', permissions: basePermissions('admin'), organizationId: 'org_arqpro' },
  { id: 'u_pm1', name: 'Paulo PM', email: 'paulo@arqpro.pt', role: 'project_manager', permissions: basePermissions('project_manager'), organizationId: 'org_arqpro' },
  { id: 'u_arq1', name: 'Rita Architect', email: 'rita@arqpro.pt', role: 'architect', permissions: basePermissions('architect'), organizationId: 'org_arqpro' },
  { id: 'u_dir2', name: 'Duarte Director', email: 'duarte@engmod.pt', role: 'project_manager', permissions: basePermissions('project_manager'), organizationId: 'org_engmod' },
  { id: 'u_client', name: 'Cliente XPTO', email: 'cliente@xpto.com', role: 'client_viewer', permissions: basePermissions('client_viewer'), organizationId: 'org_arqpro' },
];

export const clients: Client[] = [
  {
    id: 'c_dev1',
    name: 'DevPrime Real Estate',
    type: 'developer',
    tier: 'key',
    contacts: [ { id: 'ct1', name: 'João Martins', email: 'joao@devprime.com' } ],
    projects: { total: 6, active: 3, completed: 3, totalValue: 12000000 },
    creditRating: 'A',
    paymentTerms: 60,
    paymentHistory: [ { id: 'p1', date: iso('2024-06-10'), amount: 120000, status: 'paid' } ],
    relationship: { accountManager: 'u_pm1', satisfaction: 86, lastContact: iso('2025-08-01'), nextReview: iso('2025-09-15') },
    opportunities: [ { id: 'opp1', name: 'Campus Universitário - Fase 2', value: 4200000, stage: 'proposal' } ],
  },
  {
    id: 'c_pub1',
    name: 'CM Braga',
    type: 'government',
    tier: 'strategic',
    contacts: [ { id: 'ct2', name: 'Dra. Sofia', email: 'sofia@cm-braga.pt' } ],
    projects: { total: 4, active: 2, completed: 2, totalValue: 9000000 },
    creditRating: 'A',
    paymentTerms: 90,
    paymentHistory: [ { id: 'p2', date: iso('2025-07-11'), amount: 300000, status: 'pending' } ],
    relationship: { accountManager: 'u_pm1', satisfaction: 72, lastContact: iso('2025-08-02'), nextReview: iso('2025-09-01') },
    opportunities: [ { id: 'opp2', name: 'Hospital Central de Braga', value: 25000000, stage: 'lead' } ],
  },
];

function phase(id: string, name: string, budget: number, spent: number, progress: number, start: string, end: string): ProjectPhase {
  return {
    id,
    name,
    status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
    budget,
    spent,
    progress,
    startDate: iso(start),
    endDate: iso(end),
    deliverables: [],
    dependencies: [],
  };
}

export const projects: ProjectEnterprise[] = [
  {
    id: 'p1',
    name: 'Edifício Escritórios Premium',
    client: clients[0],
    type: 'commercial',
    scale: 'large',
    status: 'execution',
    phases: [
      phase('ph1','Estudo Prévio', 200000, 200000, 100, '2024-01-01','2024-03-01'),
      phase('ph2','Anteprojeto', 350000, 300000, 85, '2024-03-02','2024-07-01'),
      phase('ph3','Projeto de Execução', 600000, 200000, 35, '2024-07-02','2025-02-01'),
    ],
    budget: { total: 3500000, approved: 3000000, spent: 1200000, committed: 800000, forecasted: 3400000 },
    team: [ { userId: 'u_pm1', role: 'project_manager', allocation: 0.6 }, { userId: 'u_arq1', role: 'architect', allocation: 0.8 } ],
    timeline: { start: iso('2024-01-01'), phases: [], milestones: [ { id: 'm1', name: 'Licença', date: iso('2024-09-01') } ], criticalPath: [] },
    risks: [ { id: 'r1', projectId: 'p1', title: 'Atraso Licenciamento', description: 'Dependência municipal', category: 'regulatory', probability: 3, impact: 4, riskScore: 12, status: 'monitoring', owner: 'u_pm1', mitigationPlan: 'Follow-up semanal', contingencyPlan: 'Replaneamento', reviewDate: iso('2025-08-20') } ],
    profitability: { margin: 0.22, roi: 0.18, npv: 450000 },
    organizationId: 'org_arqpro',
  },
  {
    id: 'p2',
    name: 'Hospital Central de Braga',
    client: clients[1],
    type: 'infrastructure',
    scale: 'mega',
    status: 'lead',
    phases: [ phase('ph1','Estudo de Viabilidade', 900000, 0, 0, '2025-09-01','2025-12-01') ],
    budget: { total: 25000000, approved: 0, spent: 0, committed: 0, forecasted: 25000000 },
    team: [ { userId: 'u_dir2', role: 'project_manager', allocation: 0.2 } ],
    timeline: { start: iso('2025-09-01'), phases: [], milestones: [], criticalPath: [] },
    risks: [],
    profitability: { margin: 0.15, roi: 0.12, npv: 2100000 },
    organizationId: 'org_engmod',
  },
  {
    id: 'p3',
    name: 'Moradia Luxury Cascais',
    client: clients[0],
    type: 'residential',
    scale: 'medium',
    status: 'execution',
    phases: [ phase('ph1','Estudo Prévio', 40000, 40000, 100,'2024-02-01','2024-03-01') ],
    budget: { total: 800000, approved: 700000, spent: 220000, committed: 150000, forecasted: 780000 },
    team: [ { userId: 'u_pm1', role: 'project_manager', allocation: 0.2 }, { userId: 'u_arq1', role: 'architect', allocation: 0.5 } ],
    timeline: { start: iso('2024-02-01'), phases: [], milestones: [], criticalPath: [] },
    risks: [],
    profitability: { margin: 0.25, roi: 0.2, npv: 60000 },
    organizationId: 'org_arqpro',
  }
];

export const invoices: InvoiceEnterprise[] = [
  { id: 'inv1', projectId: 'p1', clientId: 'c_dev1', type: 'progress', amount: 120000, tax: 0.23, status: 'sent', dueDate: iso('2025-08-31'), paymentTerms: 60, approvals: [] },
];

export const notifications: NotificationItem[] = [
  { id: 'n1', type: 'approval', title: 'Aprovação de Fase: Anteprojeto', date: iso('2025-08-12'), read: false, link: '/projetos/p1', organizationId: 'org_arqpro' },
  { id: 'n2', type: 'deadline', title: 'Milestone Licença em 20 dias', date: iso('2025-08-10'), read: false, link: '/projetos/p1', organizationId: 'org_arqpro' },
];