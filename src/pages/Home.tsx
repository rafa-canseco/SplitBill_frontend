import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useUser } from '../contexts/UserContext';
import LogButton from '@/componentsUX/LogButton';
import Image from '../assets/image.jpg';

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
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center">
        <div className="mx-auto grid w-[350px] gap-6">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-40">SplitBill</h1>
          <p className=" leading-7 [&:not(:first-child)]:mt-6 text-balance text-muted-foreground mb-40">
            This dApp simplifies expense tracking for shared events, allowing users to easily input expenses and
            automatically rebalance payments via smart contracts.
          </p>

          <LogButton className="mt-4 leading-7 [&:not(:first-child)]:mt-6" />
        </div>
      </div>
      <div className=" lg:block">
        <img src={Image} alt="Image" width="1920" height="1080" className="h-screen w-full object-cover " />
      </div>
    </div>
  );
}

export default Home;
