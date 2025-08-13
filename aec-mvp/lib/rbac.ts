import { Permission, User } from '@/types/enterprise';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve';

export function can(user: User | undefined, resource: string, action: Action): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const allowed = user.permissions?.some((p: Permission) => p.resource === resource && p.actions.includes(action));
  return !!allowed;
}