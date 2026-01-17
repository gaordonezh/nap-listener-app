import { createContext, useContext, useState, useEffect, useMemo, Fragment, useCallback, PropsWithChildren } from 'react';
import { Alert, AppState, Linking, NativeModules, PermissionsAndroid } from 'react-native';
import PermissionsScreen from '../screens/PermissionsScreen';

interface PermissionsContextProps {
  hasNotificacionPermission: boolean;
  hasAllowedReadNotifications: boolean;
  requestNotificationPermission: () => Promise<void>;
}

const PermissionsContext = createContext({} as PermissionsContextProps);

export const usePermissionsContext = () => useContext(PermissionsContext);

const PermissionsContextProvider = ({ children }: PropsWithChildren) => {
  const [notificacionPermission, setNotificacionPermission] = useState(false);
  const [allowedReadNotifications, setAllowedReadNotifications] = useState(false);

  const checkPermission = useCallback(async () => {
    const [granted, hasPermission] = await Promise.all([NativeModules.NotificationModule.hasNotificationPermission(), checkNotificationPermission()]);

    setAllowedReadNotifications(granted);
    setNotificacionPermission(hasPermission);
  }, []);

  useEffect(() => {
    checkPermission();

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        checkPermission();
      }
    });

    return () => sub.remove();
  }, [checkPermission]);

  const checkNotificationPermission = () => PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

  const requestNotificationPermission = async (): Promise<void> => {
    const isActive = await checkNotificationPermission();
    if (isActive) {
      setNotificacionPermission(isActive);
      return;
    }

    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
    if (!hasPermission) {
      Alert.alert(
        'Permiso a notificaciones',
        'Para que la app siga registrando notificaciones, debes permitir la lectura de notificaciones notificaciones y desactivar el ahorro de batería.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir a configuración', onPress: () => Linking.openSettings() },
        ],
      );
    }

    setNotificacionPermission(hasPermission);
  };

  const values = useMemo(
    () => ({
      requestNotificationPermission,
      hasNotificacionPermission: notificacionPermission,
      hasAllowedReadNotifications: allowedReadNotifications,
    }),
    [notificacionPermission, allowedReadNotifications],
  );

  return (
    <PermissionsContext.Provider value={values}>
      <Fragment>{notificacionPermission && allowedReadNotifications ? children : <PermissionsScreen />}</Fragment>
    </PermissionsContext.Provider>
  );
};

export default PermissionsContextProvider;
