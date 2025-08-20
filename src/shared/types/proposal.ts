export type ProposalChangeType = 'modify' | 'add' | 'delete' | 'flag_error';
export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface ProposalDoc {
  id: string;
  targetPath: string; // e.g., /subjects/{sid}/types/{tid}/contents/{cid}
  changeType: ProposalChangeType;
  payload?: unknown;
  reason: string;
  status: ProposalStatus;
  createdBy: string;
  createdAt: unknown;
  approvedBy?: string;
  approvedAt?: unknown;
}


