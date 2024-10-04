import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Session {
  created_at: string;
  fiat: string;
  id: number;
  qty_users: number;
  state: string;
  total_spent: number;
  is_invited: boolean;
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
        <Table>
          <TableCaption>A list of your recent sessions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Fiat</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">{session.id}</TableCell>
                <TableCell>{session.state}</TableCell>
                <TableCell>{session.qty_users}</TableCell>
                <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
                <TableCell>{session.fiat}</TableCell>
                <TableCell className="text-right">{session.total_spent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default UserSessions;
