import { useState, useEffect } from 'react';
import { getSessionState, getSessionEvents } from '@/utils/contractInteraction';
import { useWallets } from '@privy-io/react-auth';

export function useSessionData(sessionId: string | undefined) {
  const [sessionState, setSessionState] = useState<number | null>(null);
  const [sessionEvents, setSessionEvents] = useState<any>(null);
  const [eventError, setEventError] = useState<string | null>(null);
  const { wallets } = useWallets();

  useEffect(() => {
    const fetchSessionData = async () => {
      if (sessionId && wallets[0]) {
        try {
          const state = await getSessionState(wallets[0], Number(sessionId));
          setSessionState(state);

          if (state === 2 || state === 3) {
            const events = await getSessionEvents(Number(sessionId));
            setSessionEvents(events);
          }
        } catch (error) {
          console.error('Error fetching session data:', error);
          setEventError('Failed to load session events. Please try again later.');
        }
      }
    };

    fetchSessionData();
  }, [sessionId, wallets]);

  return { sessionState, sessionEvents, eventError };
}
