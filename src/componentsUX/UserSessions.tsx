import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Session {
  created_at: string;
  fiat: string;
  id: number;
  qty_users: number;
  state: string;
  total_spent: number;
}

function UserSessions() {
  const { userData } = useUser();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!userData?.walletAddress) return;

      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/sessions/${userData.walletAddress}`);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        const data = await response.json();
        console.log(data);
        setSessions(data.sessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [userData?.walletAddress]);

  if (isLoading) return <div>Loading sessions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Your Sessions</h2>
      {!sessions || sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session.id}>
              Session ID: {session.id}, State: {session.state}, Users: {session.qty_users}, Created:{' '}
              {new Date(session.created_at).toLocaleString()}, Fiat: {session.fiat}, Total Spent: {session.total_spent}
            </li>
          ))}
        </ul>
      )}
      <Link to="/create-session">
        <Button>Create New Session</Button>
      </Link>
    </div>
  );
}

export default UserSessions;
