export type UserRole = 'newbie' | 'intermediate' | 'advanced' | 'subadmin';

export interface AppUser {
  uid: string;
  name: string;
  nickname: string;
  email: string;
  phone: string;
  role: UserRole;
  blocked: boolean;
  marketingConsent?: boolean;
  createdAt: unknown; // Firestore Timestamp
  updatedAt: unknown; // Firestore Timestamp
}


