// context/pwaContext.js
import { createContext, useContext, useState } from 'react';

const PWAContext = createContext({
  isAnkyReady: false,
  setIsAnkyReady: () => {},
  ankyImages: [],
  setAnkyImages: () => {},
  isAnkyLoading: false,
  setIsAnkyLoading: () => {},
});

export const usePWA = () => {
  return useContext(PWAContext);
};

export const PWAProvider = ({ children }) => {
  const [isAnkyReady, setIsAnkyReady] = useState(false);
  const [ankyImages, setAnkyImages] = useState([]);
  const [isAnkyLoading, setIsAnkyLoading] = useState(false);

  return (
    <PWAContext.Provider
      value={{
        isAnkyReady,
        setIsAnkyReady,
        ankyImages,
        setAnkyImages,
        isAnkyLoading,
        setIsAnkyLoading,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};
