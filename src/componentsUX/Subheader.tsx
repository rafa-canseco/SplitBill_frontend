import { useUser } from '../contexts/UserContext';
import { CircleUserRound } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function Subheader() {
  const { userData } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const abbreviateWallet = (wallet: string | undefined) => {
    if (!wallet) return '';
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  return (
    <div className=" p-4 mb-4 rounded-lg">
      <div className="flex justify-end items-center mr-4 ml-4">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger>
            <CircleUserRound className="w-8 h-8 cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-60" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">{userData?.name}</h4>
                <p className="text-sm text-muted-foreground">{userData?.email}</p>
                <p className="text-sm text-muted-foreground">Wallet: {abbreviateWallet(userData?.walletAddress)}</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default Subheader;
