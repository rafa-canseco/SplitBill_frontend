import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Participant, UserExpense } from '../types/session';

interface ExpenseFormProps {
  participants: Participant[];
  onAddExpense: (expenses: UserExpense[]) => void;
}

function ExpenseForm({ participants, onAddExpense }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amounts, setAmounts] = useState<{ [key: number]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpenses: UserExpense[] = participants
      .filter((participant) => parseFloat(amounts[participant.id] || '0') > 0)
      .map((participant) => ({
        user_id: participant.id,
        amount: parseFloat(amounts[participant.id] || '0'),
        description,
      }));

    if (newExpenses.length > 0) {
      onAddExpense(newExpenses);
      // Reset form
      setDescription('');
      setAmounts({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <Input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Expense description"
        required
      />
      {participants.map((participant) => (
        <div key={participant.id} className="flex items-center space-x-2">
          <label>{participant.name}:</label>
          <Input
            type="number"
            value={amounts[participant.id] || ''}
            onChange={(e) => setAmounts((prev) => ({ ...prev, [participant.id]: e.target.value }))}
            placeholder="Amount"
          />
        </div>
      ))}
      <Button type="submit">Add Expense</Button>
    </form>
  );
}

export default ExpenseForm;
