import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useUser } from '../contexts/UserContext';
import LogButton from '@/componentsUX/LogButton';

function Home() {
  const { authenticated, ready } = usePrivy();
  const { isRegistered, isLoading, userData } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && authenticated && isRegistered && !isLoading && userData?.is_profile_complete) {
      navigate('/dashboard');
    }
  }, [ready, authenticated, isRegistered, isLoading, userData, navigate]);

  return (
    <div>
      <h1>Enter the dApp</h1>
      <LogButton className="mt-4" />
    </div>
  );
}

export default Home;
