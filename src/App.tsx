/**
 * VAYUWISE AI - Root App Component
 */

import React from 'react';
import { AppProvider } from './context/AppContext.js';
import { AppRouter } from './app/router.js';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};

export default App;
