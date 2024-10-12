import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserSessions } from '../hooks/useUserSessions';
import { useToast } from '@/hooks/use-toast';
import { Session } from '../types/session';
import './UserSession.css';

function UserSessions() {
  const { sessions, isLoading, error, handleJoinSession } = useUserSessions();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRowClick = (session: Session) => {
    if (session.state === 'Active') {
      navigate(`/session/${session.id}`);
    } else if (session.state === 'AwaitingPayment' || session.state === 'Completed') {
      navigate(`/checkout/${session.id}`);
    } else {
      toast({
        title: 'Session not active',
        description: 'Some users still need to join this session.',
        variant: 'default',
      });
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) ? date.toLocaleString() : 'Invalid Date';
  };

  if (isLoading) return <div>Loading sessions...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Sessions</h1>
      {!sessions || sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <Table className="table-container">
          <TableCaption>A list of your recent sessions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">ID</TableHead>
              <TableHead className="text-center">State</TableHead>
              <TableHead className="text-center">Users</TableHead>
              <TableHead className="text-center">Created At</TableHead>
              <TableHead className="text-center">Currency</TableHead>
              <TableHead className="text-center">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow
                key={session.id}
                onClick={() => handleRowClick(session)}
                className={cn(
                  'cursor-pointer',
                  'glow-hover',
                  session.state === 'Completed' || session.state === 'Active'
                    ? 'glow-hover-green'
                    : session.state === 'Pending'
                      ? 'glow-hover-red'
                      : session.state === 'AwaitingPayment'
                        ? 'glow-hover-yellow'
                        : ''
                )}
              >
                <TableCell className="font-medium">{session.id}</TableCell>
                <TableCell className="text-center">{session.state}</TableCell>
                <TableCell className="text-center">{session.qty_users}</TableCell>
                <TableCell className="text-center">{formatDate(session.created_at)}</TableCell>
                <TableCell className="text-center">{session.fiat.toUpperCase()}</TableCell>
                <TableCell className="text-center">{session.total_spent.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  {!session.is_joined && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinSession(session.id);
                      }}
                    >
                      Join Session
                    </Button>
                  )}
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
