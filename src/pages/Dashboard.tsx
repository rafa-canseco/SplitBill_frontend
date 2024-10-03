import { useUser } from '../contexts/UserContext';
import UserProfileForm from '../componentsUX/UserProfileForm';
import Navbar from '../componentsUX/Navbar';

function Dashboard() {
const { userData, isLoading, error, isRegistered } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!userData || !isRegistered) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <UserProfileForm />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4">

        <div>Something else</div>
      </main>
    </div>
  );
}

export default Dashboard;