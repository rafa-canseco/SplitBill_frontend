import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Expense, Participant } from '../types/session';

interface ExpenseListProps {
  expenses: Expense[];
  participants: Participant[];
  fiat: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, participants, fiat }) => {
  return (
    <Table className="mt-6">
      <TableCaption>List of expenses for this session</TableCaption>
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
              {expense.amount} {fiat.toUpperCase()}
            </TableCell>
            <TableCell>{participants.find((p) => p.id === expense.user_id)?.name || 'Unknown'}</TableCell>
            <TableCell>{new Date(expense.date).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExpenseList;
