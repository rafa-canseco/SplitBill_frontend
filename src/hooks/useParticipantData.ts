import { useState, useEffect } from 'react';
import { getParticipantPaymentStatus, getParticipantBalance } from '@/utils/contractInteraction';

export function useParticipantData(sessionId: string | undefined, participants: any[]) {
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, boolean>>({});
  const [participantBalances, setParticipantBalances] = useState<Record<string, bigint>>({});
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const fetchParticipantData = async () => {
      if (sessionId && participants.length > 0) {
        const statuses: Record<string, boolean> = {};
        const balances: Record<string, bigint> = {};
        const totalParticipants = participants.length;

        for (let i = 0; i < totalParticipants; i++) {
          const participant = participants[i];
          const status = await getParticipantPaymentStatus(sessionId, participant.walletAddress);
          const balance = await getParticipantBalance(sessionId, participant.walletAddress);
          statuses[participant.walletAddress] = status;
          balances[participant.walletAddress] = balance;

          setLoadingProgress(((i + 1) / totalParticipants) * 100);
        }

        setPaymentStatuses(statuses);
        setParticipantBalances(balances);
      }
    };

    fetchParticipantData();
  }, [sessionId, participants]);

  return { paymentStatuses, participantBalances, loadingProgress };
}
