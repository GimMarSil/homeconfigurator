export type Role = 'admin' | 'project_manager' | 'architect' | 'engineer' | 'junior' | 'client_viewer';
export type OrgType = 'architecture' | 'engineering' | 'mixed';
export type OrgSize = 'small' | 'medium' | 'large';

export interface Permission {
  resource: string; // projects, clients, financials, reports, admin
  actions: Array<'create' | 'read' | 'update' | 'delete' | 'approve'>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  organizationId: string;
  departmentId?: string;
  hourlyRate?: number;
  costCenter?: string;
}

export interface OrganizationSettings {
  theme?: 'light' | 'dark' | 'system';
  logoUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  managerId: string;
  costCenter: string;
  budget: number;
}

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  size: OrgSize;
  departments: Department[];
  settings: OrganizationSettings;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface PaymentRecord {
  id: string;
  date: string; // ISO
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Opportunity {
  id: string;
  name: string;
  value: number;
  stage: 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost';
  closeDate?: string;
}

export interface Client {
  id: string;
  name: string;
  type: 'private' | 'corporate' | 'government' | 'developer';
  tier: 'strategic' | 'key' | 'standard';
  contacts: Contact[];
  projects: { total: number; active: number; completed: number; totalValue: number };
  creditRating: 'A' | 'B' | 'C' | 'D';
  paymentTerms: number;
  paymentHistory: PaymentRecord[];
  relationship: {
    accountManager: string;
    satisfaction: number;
    lastContact: string;
    nextReview: string;
  };
  opportunities: Opportunity[];
}

export interface Deliverable {
  id: string;
  name: string;
  status: 'pending' | 'in_review' | 'approved';
  dueDate?: string;
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
}

export interface Task {
  id: string;
  name: string;
  start: string;
  end: string;
  assignedTo?: string[];
}

export interface PhaseTimeline {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface TeamMember {
  userId: string;
  role: Role;
  allocation: number; // 0-1
}

export interface CostBreakdown {
  planned: number;
  actual: number;
  committed?: number;
}

export interface Variance {
  id: string;
  category: string;
  planned: number;
  actual: number;
  variance: number;
}

export interface Approval {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  approverIds: string[];
}

export interface ProjectFinancials {
  budget: { approved: number; contingency: number; total: number };
  costs: {
    labor: CostBreakdown;
    materials: CostBreakdown;
    external: CostBreakdown;
    overhead: CostBreakdown;
  };
  revenue: { contracted: number; invoiced: number; received: number; pending: number };
  profitability: { grossMargin: number; netMargin: number; roi: number; paybackPeriod: number };
  forecasting: { costToComplete: number; finalCost: number; varianceAnalysis: Variance[] };
}

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: 'technical' | 'financial' | 'schedule' | 'regulatory' | 'market';
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed';
  owner: string;
  mitigationPlan: string;
  contingencyPlan: string;
  reviewDate: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'review' | 'approved' | 'completed';
  budget: number;
  spent: number;
  progress: number;
  startDate: string;
  endDate: string;
  deliverables: Deliverable[];
  dependencies: string[];
}

export type ProjectType = 'residential' | 'commercial' | 'industrial' | 'infrastructure' | 'urban_planning';
export type ProjectScale = 'small' | 'medium' | 'large' | 'mega';
export type ProjectStatus = 'lead' | 'proposal' | 'contract_negotiation' | 'execution' | 'review' | 'completed' | 'on_hold' | 'cancelled';

export interface ProjectEnterprise {
  id: string;
  name: string;
  client: Client;
  type: ProjectType;
  scale: ProjectScale;
  status: ProjectStatus;
  phases: ProjectPhase[];
  budget: { total: number; approved: number; spent: number; committed: number; forecasted: number };
  team: TeamMember[];
  timeline: { start: string; phases: PhaseTimeline[]; milestones: Milestone[]; criticalPath: Task[] };
  risks: Risk[];
  profitability: { margin: number; roi: number; npv: number };
  financials?: ProjectFinancials;
  organizationId: string;
}

export interface InvoiceEnterprise {
  id: string;
  projectId: string;
  clientId: string;
  type: 'milestone' | 'progress' | 'expense' | 'retainer';
  amount: number;
  tax: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'disputed';
  dueDate: string;
  paymentTerms: number;
  milestoneId?: string;
  approvals: Approval[];
}

export interface NotificationItem {
  id: string;
  type: 'project' | 'approval' | 'deadline' | 'risk' | 'system';
  title: string;
  description?: string;
  date: string;
  read: boolean;
  link?: string;
  organizationId: string;
}