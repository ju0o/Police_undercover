export interface ActivityLogDoc {
  id: string;
  actor: string; // user ID
  action: string; // 'create', 'update', 'delete', 'approve', 'reject'
  targetPath: string; // e.g., /subjects/{id}/types/{id}/contents/{id}
  diffSummary?: string;
  createdAt: unknown;
  ip?: string;
}
