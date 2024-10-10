export interface Participant {
  id: number;
  name: string;
  walletAddress: string;
  joined: boolean;
  total_spent: number;
}

export interface Expense {
  id: number;
  session_id: number;
  user_id: number;
  amount: number;
  description: string;
  date: string;
}

export interface Session {
  id: number;
  created_at: string;
  state: string;
  fiat: string;
  total_spent: number;
  qty_users: number;
  is_joined: boolean;
}

export interface SessionDetails {
  session: Session;
  participants: Participant[];
  expenses: Expense[];
}
export interface UserExpense {
  user_id: number;
  amount: number;
  description: string;
}
