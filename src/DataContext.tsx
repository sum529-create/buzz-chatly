import React, { createContext, useState, ReactNode, useContext } from 'react';

interface ProfileData {
  imgUrl?: string;
}

interface DataContextType {
  profileData: ProfileData | null;
  setProfileData: (data: ProfileData | null) => void;
}

const initialContext: DataContextType = {
  profileData: null,
  setProfileData: () => {},
};

export const DataContext = createContext<DataContextType>(initialContext);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  return (
    <DataContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </DataContext.Provider>
  );
};
export const useDataContext = () => useContext(DataContext);