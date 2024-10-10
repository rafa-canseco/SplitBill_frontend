import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchSessionDetails, createExpense } from '../utils/api';
import { SessionDetails, UserExpense } from '../types/session';

export function useSessionDetails(sessionId: string) {
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingExpenses, setPendingExpenses] = useState<UserExpense[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [conceptFilter, setConceptFilter] = useState<string>('');
  const { toast } = useToast();

  const loadSessionDetails = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const details = await fetchSessionDetails(sessionId);
      setSessionDetails(details);
    } catch (error) {
      console.error('Error loading session details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load session details',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  const handleAddExpense = (newExpenses: UserExpense[]) => {
    setPendingExpenses((prev) => [...prev, ...newExpenses]);
  };

  const handleRegisterExpenses = async () => {
    if (!sessionDetails || pendingExpenses.length === 0) return;

    try {
      await createExpense(sessionDetails.session.id, pendingExpenses);
      setPendingExpenses([]);
      toast({
        title: 'Success',
        description: 'Expenses registered successfully',
      });
      await loadSessionDetails();
    } catch (error) {
      console.error('Error registering expenses:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to register expenses',
      });
    }
  };

  const filteredExpenses = sessionDetails
    ? sessionDetails.expenses.filter((expense) => {
        const userMatch = selectedUser === 'all' || expense.user_id.toString() === selectedUser;
        const dateMatch =
          !dateFilter || new Date(expense.date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
        const conceptMatch = !conceptFilter || expense.description.toLowerCase().includes(conceptFilter.toLowerCase());
        return userMatch && dateMatch && conceptMatch;
      })
    : [];

  return {
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
  };
}
