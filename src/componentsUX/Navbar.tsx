import { useState } from 'react';
import { ModeToggle } from './mode-toggle';
import { Link, useNavigate } from 'react-router-dom';
import { Home, DoorOpen, FilePlus, CircleUserRound } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CreateSession from '@/pages/CreateSession';
import { useUser } from '../contexts/UserContext';

function Navbar() {
  const { authenticated, logout } = usePrivy();
  const navigate = useNavigate();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const { userData } = useUser();

  const handleLogout = async () => {
    if (authenticated) {
      await logout();
      navigate('/');
    }
  };

  const abbreviateWallet = (wallet: string | undefined) => {
    if (!wallet) return '';
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-14 flex-col border-r bg-background hidden sm:flex">
      <nav className="flex flex-col items-center justify-between h-full py-4">
        <div className="flex flex-col items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/">
                  <Home className="w-6 h-6 stroke-1" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCreateSessionOpen(true)}
                  className="bg-transparent border-none p-0 cursor-pointer"
                >
                  <FilePlus className="w-6 h-6 stroke-1" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Create Session</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {authenticated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleLogout} className="bg-transparent border-none p-0 cursor-pointer">
                    <DoorOpen className="w-6 h-6 stroke-1" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex flex-col items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleUserRound className="w-6 h-6 stroke-1 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="right" className="w-60">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">{userData?.name}</h4>
                    <p className="text-sm text-muted-foreground">{userData?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Wallet: {abbreviateWallet(userData?.walletAddress || '')}
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ModeToggle />
        </div>
      </nav>
      <CreateSession isOpen={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen} />
    </aside>
  );
}

export default Navbar;
