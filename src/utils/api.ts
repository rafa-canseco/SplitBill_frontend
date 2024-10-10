import { SessionDetails, Session, UserExpense, UserData } from '../types/session';

const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchSessionDetails(sessionId: string): Promise<SessionDetails> {
  const response = await fetch(`${API_BASE_URL}/fetch_sessions/${sessionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch session details');
  }
  return response.json();
}

export async function createExpense(sessionId: number, expenses: UserExpense[]) {
  const response = await fetch(`${API_BASE_URL}/create_expense`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, expenses }),
  });

  if (!response.ok) {
    throw new Error('Failed to create expenses');
  }

  return response.json();
}

export async function fetchUserSessions(walletAddress: string): Promise<Session[]> {
  const response = await fetch(`${API_BASE_URL}/sessions/${walletAddress}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user sessions');
  }
  const data = await response.json();
  return data.sessions;
}

export async function joinSession(sessionId: number, walletAddress: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
  });
  if (!response.ok) {
    throw new Error('Failed to join session');
  }
}

export async function activateSession(sessionId: number, walletAddress: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
  });
  if (!response.ok) {
    throw new Error('Failed to activate session');
  }
}

export async function checkUserRegistration(
  privyId: string,
  walletAddress: string
): Promise<{
  isRegistered: boolean;
  isInvited: boolean;
  walletAddress: string | null;
}> {
  const response = await fetch(`${API_BASE_URL}/user/check?privy_id=${privyId}&wallet_address=${walletAddress || ''}`);
  if (!response.ok) {
    throw new Error('Failed to check user registration');
  }
  return response.json();
}

export async function fetchUserData(userId: string): Promise<UserData> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
}

export async function updateUserProfile(userId: string, data: Partial<UserData>): Promise<UserData> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }
  return response.json();
}

export async function createUserProfile(data: Partial<UserData>): Promise<UserData> {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create user profile');
  }
  return response.json();
}
