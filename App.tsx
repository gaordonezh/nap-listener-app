import React, { Fragment, useEffect, useState } from 'react';
import AppContextProvider from './src/context/AppContext';
import PermissionsContextProvider from './src/context/PermissionsContext';
import InformationScreen from './src/screens/InformationScreen';
import { NativeModules, Text, View } from 'react-native';
import { phoneNumberUtils } from './src/utils/functions';

const App = () => {
  const [waiting, setWaiting] = useState(true);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    (async () => {
      try {
        const phoneSaved: null | string = await NativeModules.NotificationModule.getUserName();
        const valid = phoneNumberUtils.valid(phoneSaved || '');
        setWaiting(!valid);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <Fragment>
      {waiting ? (
        <InformationScreen onCheck={() => setWaiting(false)} />
      ) : (
        <PermissionsContextProvider>
          <AppContextProvider />
        </PermissionsContextProvider>
      )}
      <View style={{ backgroundColor: '#0f172a', padding: 12, paddingBottom: 16 }}>
        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '300', fontSize: 16 }}>Netappperu SAC © {currentYear}</Text>
      </View>
    </Fragment>
  );
};

export default App;
