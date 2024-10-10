import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Participant } from '../types/session';

interface ExpenseFiltersProps {
  selectedUser: string;
  setSelectedUser: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  conceptFilter: string;
  setConceptFilter: (value: string) => void;
  participants: Participant[];
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  selectedUser,
  setSelectedUser,
  dateFilter,
  setDateFilter,
  conceptFilter,
  setConceptFilter,
  participants,
}) => {
  return (
    <div className="mt-6 mb-4  space-y-4">
      <Select value={selectedUser} onValueChange={setSelectedUser}>
        <SelectTrigger>
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {participants.map((participant) => (
            <SelectItem key={participant.id} value={participant.id.toString()}>
              {participant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        placeholder="Filter by date"
      />
      <Input
        type="text"
        value={conceptFilter}
        onChange={(e) => setConceptFilter(e.target.value)}
        placeholder="Filter by concept"
      />
    </div>
  );
};

export default ExpenseFilters;
