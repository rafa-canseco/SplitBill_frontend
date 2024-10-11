import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useWallets } from '@privy-io/react-auth';
import {
  joinSessionOnChain,
  checkAllParticipantsJoined,
  getSessionState,
  getSessionStateString,
} from '@/utils/contractInteraction';
import { Session } from '../types/session';
import { fetchUserSessions, joinSession } from '../utils/api';

export function useUserSessions() {
  const { userData } = useUser();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { wallets } = useWallets();

  const updateSessionStates = useCallback(
    async (sessionsToUpdate: Session[]) => {
      if (!wallets[0]) return sessionsToUpdate;
      const wallet = wallets[0];

      const updatedSessions = await Promise.all(
        sessionsToUpdate.map(async (session) => {
          const state = await getSessionState(wallet, session.id);
          return { ...session, state: getSessionStateString(state) };
        })
      );

      return updatedSessions;
    },
    [wallets]
  );

  const loadSessions = useCallback(async () => {
    if (!userData?.walletAddress) return;
    setIsLoading(true);
    try {
      const fetchedSessions = await fetchUserSessions(userData.walletAddress);
      const sessionsWithUpdatedStates = await updateSessionStates(fetchedSessions);
      setSessions(sessionsWithUpdatedStates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userData?.walletAddress, updateSessionStates]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleJoinSession = useCallback(
    async (sessionId: number) => {
      if (!userData?.walletAddress) return;

      try {
        const wallet = wallets[0];

        toast({
          description: 'Joining session on blockchain. Please confirm the transaction.',
        });

        const txHash = await joinSessionOnChain(wallet, sessionId);

        toast({
          description: `Transaction submitted. Hash: ${txHash}`,
          duration: 5000,
        });

        await joinSession(sessionId, userData.walletAddress);

        toast({
          description: 'Successfully joined the session.',
        });

        const allJoined = await checkAllParticipantsJoined(wallet, sessionId);
        if (allJoined) {
          const sessionState = await getSessionState(wallet, sessionId);
          setSessions(
            (prevSessions) =>
              prevSessions?.map((session) =>
                session.id === sessionId ? { ...session, state: sessionState } : session
              ) ?? null
          );

          toast({
            description: `All participants have joined. Session state: ${sessionState}`,
          });
        }

        await loadSessions();
      } catch (error) {
        console.error('Error joining session:', error);
        toast({
          variant: 'destructive',
          description: error instanceof Error ? error.message : 'Failed to join session.',
        });
      }
    },
    [userData?.walletAddress, wallets, toast, loadSessions]
  );

  return { sessions, isLoading, error, handleJoinSession };
}
