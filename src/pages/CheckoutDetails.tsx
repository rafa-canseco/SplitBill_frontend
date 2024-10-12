import React from 'react';
import { useParams } from 'react-router-dom';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { Button } from '@/components/ui/button';
import Navbar from '@/componentsUX/Navbar';
import Subheader from '@/componentsUX/Subheader';
import { useUser } from '../contexts/UserContext';
import { makePaymentOnChain } from '@/utils/contractInteraction';
import { Progress } from '@/components/ui/progress';
import { useWallets } from '@privy-io/react-auth';
import { useToast } from '@/hooks/use-toast';
import { useSessionData } from '@/hooks/useSessionData';
import { useParticipantData } from '@/hooks/useParticipantData';
import { ParticipantTable } from '@/componentsUX/ParticipantTable';
import { EventTable } from '@/componentsUX/EventTable';
import { formatBalance } from '@/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function CheckoutDetails() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessionDetails, loading } = useSessionDetails(sessionId || '');
  const { userData } = useUser();
  const { wallets } = useWallets();
  const { toast } = useToast();

  const { sessionState, sessionEvents, eventError } = useSessionData(sessionId);
  const { paymentStatuses, participantBalances, loadingProgress } = useParticipantData(
    sessionId,
    sessionDetails?.participants || []
  );

  if (loading || !sessionDetails) return <div>Loading session details...</div>;

  const { session, participants, expenses } = sessionDetails;

  const handlePayment = async () => {
    if (!userData?.walletAddress || !sessionId) return;

    try {
      const wallet = wallets[0];

      toast({
        description: 'Initiating payment process. This may require multiple transactions.',
      });

      const amountToPayInUSDC = Math.abs(Number(userBalance));
      const hash = await makePaymentOnChain(wallet, Number(sessionId), amountToPayInUSDC);

      toast({
        description: `Payment transaction submitted. Hash: ${hash}`,
        duration: 5000,
      });

      // Actualizar el estado local después del pago
      setPaymentStatuses((prev) => ({ ...prev, [userData.walletAddress]: true }));
      setParticipantBalances((prev) => ({ ...prev, [userData.walletAddress]: BigInt(0) }));

      toast({
        description: 'Payment successful.',
      });
    } catch (error) {
      console.error('Error making payment:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to make payment.',
      });
    }
  };

  const userBalance = participantBalances[userData?.walletAddress || ''] || BigInt(0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Subheader />
      <main className="flex-grow p-4">
        <h2 className="text-2xl font-bold mb-4">Checkout Details - Session {session.id}</h2>

        {loadingProgress < 100 && (
          <div className="mb-4">
            <p>Loading participant data...</p>
            <Progress value={loadingProgress} className="w-full" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Participant Balances</h3>
            <ParticipantTable
              participants={participants}
              balances={participantBalances}
              statuses={paymentStatuses}
              loadingProgress={loadingProgress}
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Session Summary</h3>
            <p>Total Spent: ${formatBalance(BigInt(session.total_spent))}</p>
            <p>Average Expense: ${formatBalance(BigInt(session.total_spent) / BigInt(participants.length))}</p>
            {loadingProgress === 100 && userBalance < BigInt(0) && !paymentStatuses[userData?.walletAddress || ''] && (
              <Button onClick={handlePayment} className="mt-4">
                Pay ${formatBalance(-userBalance)}
              </Button>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">Expense List</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Description</TableHead>
              <TableHead className="text-center">Amount</TableHead>
              <TableHead className="text-center">Payer</TableHead>
              <TableHead className="text-center">Date</TableHead>
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

        {(sessionState === 2 || sessionState === 3) && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Transaction Events</h3>
            {eventError ? <p className="text-red-500">{eventError}</p> : <EventTable events={sessionEvents} />}
          </div>
        )}
      </main>
    </div>
  );
}

export default CheckoutDetails;
