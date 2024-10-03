import { useUser } from '../contexts/UserContext';
import UserProfileForm from '../componentsUX/UserProfileForm';
import LogButton from '../componentsUX/LogButton';

function Dashboard() {
const { userData, isLoading, error, isRegistered } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!userData || !isRegistered) {
    return <UserProfileForm />;
  }

  return (
    <div>
      <h1>Welcome, {userData.name}!</h1>
      <p>Email: {userData.email}</p>
      <p>Wallet: {userData.walletAddress}</p>
      <LogButton />
    </div>
  );
}

export default Dashboard;