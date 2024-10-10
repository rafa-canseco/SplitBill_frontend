import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ExpenseForm from './ExpenseForm';
import { Participant, UserExpense } from '../types/session';

interface CreateExpenseModalProps {
  participants: Participant[];
  onAddExpense: (expenses: UserExpense[]) => void;
}

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({ participants, onAddExpense }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Expense</DialogTitle>
          <DialogDescription>Add a new expense to the session. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <ExpenseForm participants={participants} onAddExpense={onAddExpense} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateExpenseModal;
