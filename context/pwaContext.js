import { createContext, useContext, useState } from 'react';

const PWAContext = createContext({
  isAnkyReady: false,
  setIsAnkyReady: () => {},
  ankyImages: [],
  setAnkyImages: () => {},
  isAnkyLoading: false,
  setIsAnkyLoading: () => {},
  meditationReady: true,
  setMeditationReady: () => {},
  writingReady: true,
  setWritingReady: () => {},
  enteredTheAnkyverse: true,
  setEnteredTheAnkyverse: () => {},
});

export const usePWA = () => {
  console.log('inside the usepwa function');
  return useContext(PWAContext);
};

export const PWAProvider = ({ children }) => {
  console.log('inside the pwa provider');
  const [isAnkyReady, setIsAnkyReady] = useState(false);
  const [ankyImages, setAnkyImages] = useState([]);
  const [isAnkyLoading, setIsAnkyLoading] = useState(false);
  const [meditationReady, setMeditationReady] = useState(false);
  const [writingReady, setWritingReady] = useState(false);
  const [enteredTheAnkyverse, setEnteredTheAnkyverse] = useState(false);

  return (
    <PWAContext.Provider
      value={{
        isAnkyReady,
        setIsAnkyReady,
        ankyImages,
        setAnkyImages,
        isAnkyLoading,
        setIsAnkyLoading,
        meditationReady,
        setMeditationReady,
        writingReady,
        setWritingReady,
        enteredTheAnkyverse,
        setEnteredTheAnkyverse,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};
