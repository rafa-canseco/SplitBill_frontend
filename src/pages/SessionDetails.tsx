import React from 'react';
import { useParams } from 'react-router-dom';
import { useSessionDetails } from '../hooks/useSessionDetails';
import Subheader from '@/componentsUX/Subheader';
import { Button } from '@/components/ui/button';
import ExpenseForm from '@/componentsUX/ExpenseForm';
import ParticipantTotals from '@/componentsUX/ParticipantTotals';
import ExpenseList from '@/componentsUX/ExpenseList';
import ExpenseFilters from '@/componentsUX/ExpenseFilters';
import Navbar from '@/componentsUX/Navbar';

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
          <p>
            Total Spent: {session.total_spent} {session.fiat.toUpperCase()}
          </p>
        </div>

        <ParticipantTotals participants={participants} fiat={session.fiat} />

        <ExpenseForm participants={participants} onAddExpense={handleAddExpense} />

        {pendingExpenses.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Pending Expenses</h3>
            <ul>
              {pendingExpenses.map((expense, index) => (
                <li key={index}>
                  {expense.description}: {expense.amount} {session.fiat.toUpperCase()}(
                  {participants.find((p) => p.id === expense.user_id)?.name})
                </li>
              ))}
            </ul>
            <Button onClick={handleRegisterExpenses} className="mt-2">
              Register Expenses
            </Button>
          </div>
        )}

        <ExpenseFilters
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          conceptFilter={conceptFilter}
          setConceptFilter={setConceptFilter}
          participants={participants}
        />

        <ExpenseList expenses={filteredExpenses} participants={participants} fiat={session.fiat} />
      </main>
    </div>
  );
}

export default SessionDetails;
