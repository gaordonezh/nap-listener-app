import { createContext, useContext, useState, useEffect, useMemo, Fragment } from 'react';
import LoaderScreen from '../screens/LoaderScreen';
import ValidateClientScreen from '../screens/ValidateClientScreen';
import { ClientProps } from '../types/global';
import ListenerNotificationsScreen from '../screens/ListenerNotificationsScreen';
import { Alert, NativeModules } from 'react-native';
import { handleGetClientData } from '../services/requests';
import { phoneNumberUtils } from '../utils/functions';

interface AppContextProps {
  setClient: (client: ClientProps) => void;
  client: ClientProps;
}

const AppContext = createContext({} as AppContextProps);

export const useAppContext = () => useContext(AppContext);

const AppContextProvider = () => {
  const [loading, setLoading] = useState(false);
  const [currentClient, setCurrentClient] = useState({} as ClientProps);

  useEffect(() => {
    verifyClient();
  }, []);

  const verifyClient = async () => {
    try {
      setLoading(true);

      const phoneSaved: string = await NativeModules.NotificationModule.getUserName();
      const isValid = phoneNumberUtils.valid(phoneSaved || '');
      if (!isValid) throw new Error('NOT FOUND 1');

      const client = await handleGetClientData(phoneSaved);
      if (!client) throw new Error('NOT FOUND 2');

      setCurrentClient(client);
    } catch (error) {
      console.log(error);
      await NativeModules.NotificationModule.saveUserName('-');
    } finally {
      setLoading(false);
    }
  };

  const handleSetClient = async (client: ClientProps) => {
    try {
      setLoading(true);
      await NativeModules.NotificationModule.saveUserName(client.phone);
      setCurrentClient(client);
    } catch (error: any) {
      Alert.alert('No se estableció el usuario correctamente', String(error.message));
    } finally {
      setLoading(false);
    }
  };

  const values = useMemo(() => ({ setClient: handleSetClient, client: currentClient }), [currentClient]);

  return (
    <AppContext.Provider value={values}>
      {loading ? <LoaderScreen /> : <Fragment>{currentClient._id ? <ListenerNotificationsScreen /> : <ValidateClientScreen />}</Fragment>}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
