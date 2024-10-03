import { useUser } from '../contexts/UserContext';
import UserProfileForm from '../componentsUX/UserProfileForm';
import LogButton from '../componentsUX/LogButton';
import { ModeToggle } from '@/componentsUX/mode-toggle';

function Dashboard() {
const { userData, isLoading, error, isRegistered } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!userData || !isRegistered) {
    return (
      <>
        <ModeToggle />
        <UserProfileForm />
      </>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <ModeToggle />
      <div className="flex flex-row  justify-between">
        <h1 className="mr-4">Welcome, {userData.name}!</h1>
        <LogButton />
      </div>
      <div className="mt-4">
        <p className="mr-4">Email: {userData.email}</p>
        <p className="mr-4">Wallet: {userData.walletAddress}</p>
      </div>
        <div>Something else</div>
    </div>
  );
}

export default Dashboard;