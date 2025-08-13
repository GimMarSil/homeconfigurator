"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, InvoiceEnterprise, NotificationItem, Organization, ProjectEnterprise, User } from '@/types/enterprise';
import * as mock from '@/data/mock';

interface AppState {
  organizations: Organization[];
  users: User[];
  clients: Client[];
  projects: ProjectEnterprise[];
  invoices: InvoiceEnterprise[];
  notifications: NotificationItem[];
  currentUserId?: string;
  currentOrganizationId?: string;

  // derived getters
  currentUser?: User;
  currentOrganization?: Organization;

  // actions
  loginAs: (userId: string) => void;
  logout: () => void;
  switchOrganization: (orgId: string) => void;
}

export const useAppStore = create<AppState>()(persist((set, get) => ({
  organizations: mock.organizations,
  users: mock.users,
  clients: mock.clients,
  projects: mock.projects,
  invoices: mock.invoices,
  notifications: mock.notifications,
  currentUserId: mock.users[0]?.id,
  currentOrganizationId: mock.organizations[0]?.id,

  get currentUser() { return get().users.find(u => u.id === get().currentUserId); },
  get currentOrganization() { return get().organizations.find(o => o.id === get().currentOrganizationId); },

  loginAs: (userId) => set({ currentUserId: userId, currentOrganizationId: get().users.find(u => u.id === userId)?.organizationId }),
  logout: () => set({ currentUserId: undefined }),
  switchOrganization: (orgId) => set({ currentOrganizationId: orgId }),
}), {
  name: 'aec-mvp-store',
  partialize: (state) => ({
    organizations: state.organizations,
    users: state.users,
    clients: state.clients,
    projects: state.projects,
    invoices: state.invoices,
    notifications: state.notifications,
    currentUserId: state.currentUserId,
    currentOrganizationId: state.currentOrganizationId,
  })
}));