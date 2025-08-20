import type { UserRole } from '@/shared/types/user';

type Action = 'read' | 'create' | 'update' | 'delete' | 'lock' | 'approve' | 'reject' | 'edit';
type Resource =
  | 'subject'
  | 'type'
  | 'content'
  | 'proposal'
  | 'annotation'
  | 'discussion'
  | 'comment'
  | 'template'
  | 'roleRequest'
  | 'notification'
  | 'watchlist';

export function can(action: Action, resource: Resource, role: UserRole | null | undefined): boolean {
  if (!role) return action === 'read';
  const r = role;
  if (r === 'subadmin') return true;
  if (resource === 'discussion' || resource === 'comment') {
    if (action === 'lock') return false; // only subadmin
    return action !== 'delete';
  }
  if (resource === 'watchlist' || resource === 'notification') {
    return action !== 'delete' || r !== 'newbie';
  }
  if (resource === 'template') {
    return action === 'read';
  }
  if (resource === 'roleRequest') {
    return action === 'create' || action === 'read';
  }
  if (resource === 'content') {
    if (action === 'create') return r === 'intermediate' || r === 'advanced';
    if (action === 'update' || action === 'edit') return r === 'advanced' || r === 'intermediate';
  }
  return action === 'read';
}


