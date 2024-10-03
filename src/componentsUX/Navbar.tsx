import { useUser } from '../contexts/UserContext';
import LogButton from './LogButton';
import { ModeToggle } from './mode-toggle';

function Navbar() {
  const { userData } = useUser();

  return (
    <nav className="flex items-center justify-between p-4 bg-background">
      <div className="flex items-center">
        {userData && (
          <>
            <span className="mr-4">Welcome, {userData.name}!</span>
            <span className="mr-4">Wallet: {userData.walletAddress}</span>
            <span className="mr-4">Email: {userData.email}</span>
          </>
        )}
      </div>
      <div className="flex items-center">
        <LogButton className="mr-4" />
        <ModeToggle />
      </div>
    </nav>
  );
}

export default Navbar;