import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createSessionOnChain } from '../utils/contractInteraction';
import { useWallets } from '@privy-io/react-auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';

interface CreateSessionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateSession({ isOpen, onOpenChange }: CreateSessionProps) {
  const { userData } = useUser();
  const [qtyUsers, setQtyUsers] = useState(1);
  const [additionalWallets, setAdditionalWallets] = useState<string[]>([]);
  const { toast } = useToast();
  const { wallets } = useWallets();

  const handleQtyUsersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQty = parseInt(e.target.value);
    setQtyUsers(newQty);
    setAdditionalWallets((prev) => {
      const newWallets = [...prev];
      if (newQty > prev.length + 1) {
        return [...newWallets, ...Array(newQty - prev.length - 1).fill('')];
      } else {
        return newWallets.slice(0, newQty - 1);
      }
    });
  };

  const handleWalletChange = (index: number, value: string) => {
    setAdditionalWallets((prev) => {
      const newWallets = [...prev];
      newWallets[index] = value;
      return newWallets;
    });
  };

  const validateWallets = () => {
    const allWallets = [userData?.walletAddress, ...additionalWallets].filter((wallet) => wallet !== '');
    const uniqueWallets = new Set(allWallets);
    return uniqueWallets.size === allWallets.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.walletAddress) return;

    if (!validateWallets()) {
      toast({
        variant: 'destructive',
        description: 'Duplicate wallet addresses found. Please ensure all addresses are unique.',
      });
      return;
    }

    try {
      const wallet = wallets[0];
      const invitedParticipants = additionalWallets.filter((wallet) => wallet !== '');

      toast({
        description: 'Creating session on blockchain. Please confirm the transaction.',
      });
      const { sessionId, hash } = await createSessionOnChain(wallet, invitedParticipants);
      toast({
        description: `Transaction submitted. Hash: ${hash}`,
        duration: 5000,
      });

      const allParticipants = [
        { walletAddress: userData.walletAddress, joined: true },
        ...invitedParticipants.map((wallet) => ({ walletAddress: wallet, joined: false })),
      ];

      const response = await fetch('http://localhost:8000/create_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: sessionId,
          state: qtyUsers > 1 ? 'PendingUsers' : 'Active',
          fiat: 'usdc',
          qty_users: qtyUsers,
          participants: allParticipants,
        }),
      });

      if (!response.ok) throw new Error('Failed to create session in database');

      await response.json();

      toast({
        description: 'Session created successfully on-chain and off-chain.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to create session.',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Session</SheetTitle>
          <SheetDescription>Set up a new expense sharing session with your friends.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">User 1 (You):</label>
            <Input type="text" value={userData?.walletAddress || ''} disabled className="w-full" />
          </div>
          <div>
            <label htmlFor="qtyUsers" className="block text-sm font-medium mb-1">
              Total Number of Users:
            </label>
            <Input
              type="number"
              id="qtyUsers"
              value={qtyUsers}
              onChange={handleQtyUsersChange}
              min="1"
              className="w-full"
            />
          </div>
          {additionalWallets.map((wallet, index) => (
            <div key={index}>
              <label htmlFor={`wallet-${index}`} className="block text-sm font-medium mb-1">
                User {index + 2} Wallet Address:
              </label>
              <Input
                type="text"
                id={`wallet-${index}`}
                value={wallet}
                onChange={(e) => handleWalletChange(index, e.target.value)}
                placeholder="Enter wallet address"
                className="w-full"
              />
            </div>
          ))}
          <SheetFooter>
            <Button type="submit">Create Session</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default CreateSession;
