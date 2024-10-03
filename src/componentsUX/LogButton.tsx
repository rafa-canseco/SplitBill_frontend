import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface LogButtonProps {
  className?: string;
}

function LogButton({ className }: LogButtonProps) {
  const { authenticated, login, logout } = usePrivy();
  const { fetchUserData } = useUser();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (authenticated) {
      await logout();
      navigate('/');
    } else {
      await login();
      await fetchUserData();
    }
  };

  return (
    <Button className={className} onClick={handleClick}>
      {authenticated ? 'Log out' : 'Log in'}
    </Button>
  );
}

export default LogButton;
