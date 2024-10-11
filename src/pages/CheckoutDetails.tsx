import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { Button } from '@/components/ui/button';
import Navbar from '@/componentsUX/Navbar';
import Subheader from '@/componentsUX/Subheader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUser } from '../contexts/UserContext';
import { getParticipantPaymentStatus, getParticipantBalance } from '@/utils/contractInteraction';
import { Progress } from '@/components/ui/progress';

function CheckoutDetails() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessionDetails, loading } = useSessionDetails(sessionId || '');
  const { userData } = useUser();
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, boolean>>({});
  const [participantBalances, setParticipantBalances] = useState<Record<string, bigint>>({});
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const fetchParticipantData = async () => {
      if (sessionDetails && sessionId) {
        const statuses: Record<string, boolean> = {};
        const balances: Record<string, bigint> = {};
        const totalParticipants = sessionDetails.participants.length;

        for (let i = 0; i < totalParticipants; i++) {
          const participant = sessionDetails.participants[i];
          const status = await getParticipantPaymentStatus(sessionId, participant.walletAddress);
          const balance = await getParticipantBalance(sessionId, participant.walletAddress);
          statuses[participant.walletAddress] = status;
          balances[participant.walletAddress] = balance;

          setLoadingProgress(((i + 1) / totalParticipants) * 100);
        }

        setPaymentStatuses(statuses);
        setParticipantBalances(balances);
      }
    };

    fetchParticipantData();
  }, [sessionDetails, sessionId]);

  if (loading || !sessionDetails) return <div>Loading session details...</div>;

  const { session, participants, expenses } = sessionDetails;

  const handlePayment = () => {
    // Implement payment logic here
    console.log('Payment initiated');
  };

  const userBalance = participantBalances[userData?.walletAddress || ''] || BigInt(0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Subheader />
      <main className="flex-grow p-4">
        <h2 className="text-2xl font-bold mb-4">Checkout Details - Session {session.id}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Participant Balances</h3>
            {loadingProgress < 100 && (
              <div className="mb-4">
                <p>Loading balances and payment statuses...</p>
                <Progress value={loadingProgress} className="w-full" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell>
                      {loadingProgress < 100
                        ? 'Loading...'
                        : `${participantBalances[participant.walletAddress]?.toString() || '0'} ${session.fiat.toUpperCase()}`}
                    </TableCell>
                    <TableCell>
                      {loadingProgress < 100
                        ? 'Loading...'
                        : paymentStatuses[participant.walletAddress]
                          ? 'Paid'
                          : 'Pending'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Session Summary</h3>
            <p>
              Total Spent: {session.total_spent} {session.fiat.toUpperCase()}
            </p>
            <p>
              Average Expense: {session.total_spent / participants.length} {session.fiat.toUpperCase()}
            </p>
            {loadingProgress === 100 && userBalance < BigInt(0) && !paymentStatuses[userData?.walletAddress || ''] && (
              <Button onClick={handlePayment} className="mt-4">
                Pay {Math.abs(Number(userBalance))} {session.fiat.toUpperCase()}
              </Button>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">Expense List</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payer</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.description}</TableCell>
                <TableCell>
                  {expense.amount} {session.fiat.toUpperCase()}
                </TableCell>
                <TableCell>{participants.find((p) => p.id === expense.user_id)?.name}</TableCell>
                <TableCell>{new Date(expense.date).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}

export default CheckoutDetails;
