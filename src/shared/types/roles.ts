import type { UserRole } from './user';

export type RoleRequestStatus = 'pending' | 'approved' | 'rejected';

export interface RoleRequestDoc {
  id: string;
  uid: string;
  fromRole: UserRole;
  toRole: UserRole;
  reason: string;
  status: RoleRequestStatus;
  createdAt: unknown;
  reviewedBy?: string;
  reviewedAt?: unknown;
}


