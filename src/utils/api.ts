import SessionDetails from '../types/session';
import { UserExpense } from '../types/session';

export async function fetchSessionDetails(sessionId: string): Promise<SessionDetails> {
  const response = await fetch(`http://localhost:8000/api/fetch_sessions/${sessionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch session details');
  }
  return response.json();
}

export async function createExpense(sessionId: number, expenses: UserExpense[]) {
  const response = await fetch('http://localhost:8000/create_expense', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      expenses: expenses,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create expenses');
  }

  return response.json();
}
