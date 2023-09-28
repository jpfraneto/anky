import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userAppInformation, setUserAppInformation] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch user-related data functions go here (like airdropCall, callTba, fetchUserJournals, etc.)

  useEffect(() => {
    const setup = async () => {
      // Fetch user information logic...
      setLoading(false);
    };
    setup();
  }, [userAppInformation.wallet]);

  return (
    <UserContext.Provider
      value={{ userAppInformation, setUserAppInformation, loading }}
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
