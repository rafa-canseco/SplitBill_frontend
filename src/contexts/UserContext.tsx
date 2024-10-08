import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { usePrivy, User } from '@privy-io/react-auth';

interface UserData {
  id: number;
  privy_id: string;
  name: string | null;
  email: string | null;
  walletAddress: string | null;
  is_profile_complete: boolean;
  is_invited: boolean;
}

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  privyUser: User | null;
  isRegistered: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, ready } = usePrivy();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const fetchUserData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const walletAddress = user.wallet?.address;
      const checkResponse = await fetch(
        `http://localhost:8000/api/user/check?privy_id=${user.id}&wallet_address=${walletAddress || ''}`
      );
      if (!checkResponse.ok) {
        throw new Error('Failed to check user registration');
      }
      const { isRegistered, isInvited, walletAddress: invitedWalletAddress } = await checkResponse.json();

      if (isInvited) {
        setUserData({
          id: 0,
          privy_id: user.id,
          name: null,
          email: user.email?.address || null,
          walletAddress: invitedWalletAddress,
          is_profile_complete: false,
          is_invited: true,
        });
        setIsRegistered(false);
      } else if (!isRegistered) {
        // Nuevo usuario, no invitado
        setUserData({
          id: 0,
          privy_id: user.id,
          name: null,
          email: user.email?.address || null,
          walletAddress: walletAddress || null,
          is_profile_complete: false,
          is_invited: false,
        });
        setIsRegistered(false);
      } else {
        // Este caso no debería ocurrir dado nuestro flujo, pero lo mantenemos por completitud
        const userDataResponse = await fetch(`http://localhost:8000/api/user/${user.id}`);
        if (!userDataResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userDataResponse.json();
        setUserData(userData);
        setIsRegistered(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsRegistered(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const method = userData?.id ? 'PUT' : 'POST';
      const endpoint = userData?.id ? `http://localhost:8000/api/user/${user.id}` : 'http://localhost:8000/api/user';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, privy_id: user.id }),
      });

      if (!response.ok) throw new Error('Failed to update user profile');
      const updatedUser = await response.json();
      setUserData(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ready && user && !userData) {
      fetchUserData();
    } else if (ready && !user) {
      setIsLoading(false);
      setUserData(null);
    }
  }, [ready, user]);

  return (
    <UserContext.Provider
      value={{
        userData,
        isLoading,
        error,
        fetchUserData,
        updateUserProfile,
        privyUser: user,
        isRegistered: isRegistered,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
