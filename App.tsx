import React from 'react';
import AppContextProvider from './src/context/AppContext';
import PermissionsContextProvider from './src/context/PermissionsContext';

const App = () => (
  <PermissionsContextProvider>
    <AppContextProvider />
  </PermissionsContextProvider>
);

export default App;
