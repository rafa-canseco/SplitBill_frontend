import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useWallets } from '@privy-io/react-auth';
import { joinSessionOnChain, checkAllParticipantsJoined } from '@/utils/contractInteraction';
import { Session } from '../types/session';
import { fetchUserSessions, joinSession, activateSession } from '../utils/api';

export function useUserSessions() {
  const { userData } = useUser();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { wallets } = useWallets();

  const loadSessions = useCallback(async () => {
    if (!userData?.walletAddress) return;
    setIsLoading(true);
    try {
      const fetchedSessions = await fetchUserSessions(userData.walletAddress);
      setSessions(fetchedSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userData?.walletAddress]);

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

        setSessions(
          (prevSessions) =>
            prevSessions?.map((session) => (session.id === sessionId ? { ...session, is_joined: true } : session)) ??
            null
        );

        toast({
          description: 'Successfully joined the session.',
        });

        const allJoined = await checkAllParticipantsJoined(wallet, sessionId);
        if (allJoined) {
          await activateSession(sessionId, userData.walletAddress);
          setSessions(
            (prevSessions) =>
              prevSessions?.map((session) => (session.id === sessionId ? { ...session, state: 'Active' } : session)) ??
              null
          );

          toast({
            description: 'All participants have joined. Session is now active.',
          });
        }

        loadSessions();
      } catch (error) {
        console.error('Error joining session or activating:', error);
        toast({
          variant: 'destructive',
          description: error instanceof Error ? error.message : 'Failed to join session or activate.',
        });
      }
    },
    [userData?.walletAddress, wallets, toast, loadSessions]
  );

  return { sessions, isLoading, error, handleJoinSession };
}
