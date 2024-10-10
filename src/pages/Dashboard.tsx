import { useUser } from '../contexts/UserContext';
import UserProfileForm from '../componentsUX/UserProfileForm';
import Navbar from '../componentsUX/Navbar';
import UserSessions from '@/componentsUX/UserSessions';
import Subheader from '@/componentsUX/Subheader';
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
      <div className="flex-grow p-4">
        <div className="flex items-center">
          <div className="flex-grow p-4">
            <Subheader />
          </div>
          {/* <Link to="/create-session">
            <Button>Create Session</Button>
          </Link> */}
        </div>
        <div>
          <UserSessions />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
