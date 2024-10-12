import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { Button } from '@/components/ui/button';
import ExpenseList from '@/componentsUX/ExpenseList';
import Navbar from '@/componentsUX/Navbar';
import InfoCard from '@/componentsUX/InfoCard';
import CreateExpenseSheet from '@/componentsUX/CreateExpenseSheet';
import { useWallets } from '@privy-io/react-auth';
import { checkoutSession } from '@/utils/contractInteraction';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ExpenseFilters from '@/componentsUX/ExpenseFilters';
import { ListFilter, CirclePlus, CircleCheckBig } from 'lucide-react';

function SessionDetails() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    sessionDetails,
    loading,
    pendingExpenses,
    selectedUser,
    setSelectedUser,
    dateFilter,
    setDateFilter,
    conceptFilter,
    setConceptFilter,
    filteredExpenses,
    handleAddExpense,
    handleRegisterExpenses,
  } = useSessionDetails(sessionId || '');
  const navigate = useNavigate();
  const { wallets } = useWallets();
  const { toast } = useToast();
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleCheckout = async () => {
    if (!sessionDetails) return;
    try {
      const wallet = wallets[0];
      const expenses = sessionDetails.participants.map((p) => p.total_spent);
      const balances = await checkoutSession(wallet, sessionDetails.session.id, expenses);
      navigate(`/checkout/${sessionId}`, { state: { balances } });
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: 'Failed to perform checkout. Please try again.',
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!sessionDetails) return <div>Error loading session details</div>;

  const { session, participants } = sessionDetails;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Session {session.id}</h2>
          <div className="flex items-center">
            <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button className="mr-2">
                  <ListFilter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="p-2">
                  <h3 className="text-lg font-semibold mb-2">Filters</h3>
                  <ExpenseFilters
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    conceptFilter={conceptFilter}
                    setConceptFilter={setConceptFilter}
                    participants={participants}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsCreateExpenseOpen(true)} className="mr-2">
              <CirclePlus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
            <Button onClick={handleCheckout}>
              <CircleCheckBig className="mr-2 h-4 w-4" />
              Do Checkout
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="space-y-4">
            {pendingExpenses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Pending Expenses</h3>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="space-y-2">
                    {pendingExpenses.map((expense, index) => (
                      <li key={index} className="bg-background p-2 rounded">
                        <span className="font-medium">{expense.description}:</span> {expense.amount}
                        {session.fiat.toUpperCase()}
                        <span className="italic">({participants.find((p) => p.id === expense.user_id)?.name})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button onClick={handleRegisterExpenses} className="mt-4 ">
                  Register Expenses
                </Button>
              </div>
            )}
          </div>
          <div>
            <div className="grid grid-cols-4 gap-2">
              {participants.map((participant) => (
                <InfoCard
                  key={participant.id}
                  title={participant.name}
                  value={`${participant.total_spent} ${session.fiat.toUpperCase()}`}
                  subtitle="Total Spent"
                />
              ))}
              <InfoCard title="Total Session Spent" value={`${session.total_spent} ${session.fiat.toUpperCase()}`} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ExpenseList expenses={filteredExpenses} participants={participants} fiat={session.fiat} />
        </div>
      </main>
      <CreateExpenseSheet
        isOpen={isCreateExpenseOpen}
        onOpenChange={setIsCreateExpenseOpen}
        onAddExpense={handleAddExpense}
        participants={participants}
      />
    </div>
  );
}

export default SessionDetails;
