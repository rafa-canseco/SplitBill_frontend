import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createSessionOnChain } from '../utils/contractInteraction';
import { useWallets } from '@privy-io/react-auth';

function CreateSession() {
  const { userData } = useUser();
  const navigate = useNavigate();
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
      /// todo: add correct id
      const txHash = await createSessionOnChain(wallet, 5, invitedParticipants);

      toast({
        description: `Transaction submitted. Hash: ${txHash}`,
        duration: 5000,
      });

      const participants = [
        { walletAddress: userData.walletAddress, joined: true },
        ...invitedParticipants.map((wallet) => ({ walletAddress: wallet, joined: false })),
      ];
      console.log(participants);

      const response = await fetch('http://localhost:8000/create_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: qtyUsers > 1 ? 'PendingUsers' : 'Active',
          fiat: 'usdc',
          qty_users: qtyUsers,
          participants: participants,
        }),
      });

      if (!response.ok) throw new Error('Failed to create session in database');

      await response.json();

      toast({
        description: 'Session created successfully on-chain and off-chain.',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to create session.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Session</h2>
      <div className="mb-4">
        <label className="block mb-2">User 1 (You):</label>
        <Input type="text" value={userData?.walletAddress || ''} disabled className="w-full" />
      </div>
      <div className="mb-4">
        <label htmlFor="qtyUsers" className="block mb-2">
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
        <div key={index} className="mb-4">
          <label htmlFor={`wallet-${index}`} className="block mb-2">
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
      <Button type="submit" className="w-full">
        Create Session
      </Button>
    </form>
  );
}

export default CreateSession;
