import { useUser } from '../contexts/UserContext';

function Subheader() {
  const { userData } = useUser();

  return (
    <div className="bg-secondary p-4 mb-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mr-4 ml-4">
        <h2 className="text-2xl font-semibold">{userData?.name}</h2>
        <p className="text-sm text-muted-foreground">{userData?.email}</p>
        <p className="text-sm text-muted-foreground ">Wallet: {userData?.walletAddress}</p>
      </div>
    </div>
  );
}

export default Subheader;
