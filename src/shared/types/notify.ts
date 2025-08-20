export interface WatchlistItemDoc {
  id: string; // targetKey
  targetPath: string;
  createdAt: unknown;
}

export interface NotificationDoc {
  id: string;
  type: string;
  targetPath: string;
  message: string;
  createdAt: unknown;
  read: boolean;
}


