'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import { Toaster } from 'sonner';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeSynchronizer>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </ThemeSynchronizer>
      </PersistGate>
    </Provider>
  );
}

import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

// Sub-component to dynamically sync dark mode with HTML tag classes
function ThemeSynchronizer({ children }: { children: React.ReactNode }) {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return <>{children}</>;
}

