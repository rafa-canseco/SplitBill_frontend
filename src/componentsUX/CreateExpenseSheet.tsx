import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Participant, UserExpense } from '../types/session';

interface CreateExpenseSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expenses: UserExpense[]) => void;
  participants: Participant[];
}

function CreateExpenseSheet({ isOpen, onOpenChange, onAddExpense, participants }: CreateExpenseSheetProps) {
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
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Expense</SheetTitle>
          <SheetDescription>Enter the details of the new expense for each participant.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description:
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              required
            />
          </div>
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-2">
              <label className="text-sm font-medium">{participant.name}:</label>
              <Input
                type="number"
                value={amounts[participant.id] || ''}
                onChange={(e) => setAmounts((prev) => ({ ...prev, [participant.id]: e.target.value }))}
                placeholder="Amount"
              />
            </div>
          ))}
          <SheetFooter>
            <Button type="submit">Add Expense</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default CreateExpenseSheet;
