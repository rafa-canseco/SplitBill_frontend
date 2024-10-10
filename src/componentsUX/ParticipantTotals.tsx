import React from 'react';
import { Participant } from '../types/session';

interface ParticipantTotalsProps {
  participants: Participant[];
  fiat: string;
}

const ParticipantTotals: React.FC<ParticipantTotalsProps> = ({ participants, fiat }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Participant Totals</h3>
      <div className="grid grid-cols-2 gap-4">
        {participants.map((participant) => (
          <div key={participant.id} className="bg-secondary p-4 rounded-lg">
            <p className="font-medium">{participant.name}</p>
            <p>
              Total Spent: {participant.total_spent} {fiat.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantTotals;
