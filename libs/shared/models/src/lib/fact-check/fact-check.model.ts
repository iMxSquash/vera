export interface FactCheck {
  id: string;
  userId: string;
  query: string;
  response: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
