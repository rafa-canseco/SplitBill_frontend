import React from 'react';
import { useParams } from 'react-router-dom';
import { useSessionDetails } from '../hooks/useSessionDetails';
import Subheader from '@/componentsUX/Subheader';
import { Button } from '@/components/ui/button';
import ExpenseList from '@/componentsUX/ExpenseList';
import ExpenseFilters from '@/componentsUX/ExpenseFilters';
import Navbar from '@/componentsUX/Navbar';
import InfoCard from '@/componentsUX/InfoCard';
import CreateExpenseModal from '@/componentsUX/CreateExpenseModal';

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

  if (loading) return <div>Loading...</div>;
  if (!sessionDetails) return <div>Error loading session details</div>;

  const { session, participants } = sessionDetails;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Subheader />
      <main className="flex-grow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Session {session.id}</h2>
          <CreateExpenseModal participants={participants} onAddExpense={handleAddExpense} />
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
          <div className="space-y-4">
            <div>
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
          </div>
        </div>

        <div className="mt-4">
          <ExpenseList expenses={filteredExpenses} participants={participants} fiat={session.fiat} />
        </div>
      </main>
    </div>
  );
}

export default SessionDetails;
