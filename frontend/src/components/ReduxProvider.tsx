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

// Sub-component to dynamically sync dark mode with HTML tag classes
function ThemeSynchronizer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Read state from redux store
    const state = store.getState();
    const isDark = state.theme.darkMode;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Subscribe to theme slice updates
    const unsubscribe = store.subscribe(() => {
      const isDarkUpdated = store.getState().theme.darkMode;
      if (isDarkUpdated) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
