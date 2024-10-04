import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWallets } from '@privy-io/react-auth';
import { joinSessionOnChain, checkAllParticipantsJoined } from '@/utils/contractInteraction';

interface Session {
  created_at: string;
  fiat: string;
  id: number;
  qty_users: number;
  state: string;
  total_spent: number;
  is_invited: boolean;
  is_joined: boolean;
}

function UserSessions() {
  const { userData } = useUser();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { wallets } = useWallets();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!userData?.walletAddress) return;

      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/sessions/${userData.walletAddress}`);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        const data = await response.json();
        setSessions(data.sessions);
        console.log(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [userData?.walletAddress]);

  const handleJoinSession = async (sessionId: number) => {
    if (!userData?.walletAddress) return;

    try {
      const wallet = wallets[0];

      toast({
        description: 'Joining session on blockchain. Please confirm the transaction.',
      });

      const txHash = await joinSessionOnChain(wallet, sessionId);

      toast({
        description: `Transaction submitted. Hash: ${txHash}`,
        duration: 5000,
      });

      setSessions(
        (prevSessions) =>
          prevSessions?.map((session) => (session.id === sessionId ? { ...session, is_joined: true } : session)) || null
      );

      await fetch(`http://localhost:8000/api/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: userData.walletAddress }),
      });

      toast({
        description: 'Successfully joined the session.',
      });
      const allJoined = await checkAllParticipantsJoined(wallet, sessionId);
      if (allJoined) {
        const activateResponse = await fetch(`http://localhost:8000/api/sessions/${sessionId}/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ walletAddress: userData.walletAddress }),
        });

        if (activateResponse.ok) {
          setSessions(
            (prevSessions) =>
              prevSessions?.map((session) => (session.id === sessionId ? { ...session, state: 'Active' } : session)) ||
              null
          );

          toast({
            description: 'All participants have joined. Session is now active.',
          });
        } else {
          throw new Error('Failed to activate session in backend');
        }
      }
    } catch (error) {
      console.error('Error joining session or activating:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to join session or activate.',
      });
    }
  };

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
              <TableHead>Joined</TableHead>
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
                <TableCell>{session.is_joined ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {!session.is_joined && <Button onClick={() => handleJoinSession(session.id)}>Join Session</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default UserSessions;
