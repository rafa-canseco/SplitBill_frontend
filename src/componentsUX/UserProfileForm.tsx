import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function UserProfileForm() {
  const { userData, updateUserProfile, privyUser,isRegistered } = useUser();
  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || privyUser?.email?.address || '');
  const [walletAddress, setWalletAddress] = useState(userData?.walletAddress || privyUser?.wallet?.address || '');
  const navigate = useNavigate();
  

  useEffect(() => {
    if (isRegistered) {
      navigate('/dashboard');
    } 
  }, [userData, isRegistered, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ 
      name, 
      email, 
      walletAddress: walletAddress,
      is_profile_complete: true
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        disabled={!!privyUser?.email}
      />
      <input
        type="text"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        placeholder="Wallet Address"
        required
        disabled={!!privyUser?.wallet}
      />
      <button type="submit">Complete Registration</button>
    </form>
  );
}

export default UserProfileForm;