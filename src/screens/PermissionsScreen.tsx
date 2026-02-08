import React, { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { usePermissionsContext } from '../context/PermissionsContext';
import { MAIN_COLOR } from '../utils/constants';

const PermissionsScreen = () => {
  const { hasAllowedReadNotifications, hasNotificacionPermission, requestNotificationPermission, openNotificationListenerSettings } =
    usePermissionsContext();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Permisos</Text>

      {!hasNotificacionPermission ? (
        <Fragment>
          <View style={{ gap: 32 }}>
            <Text style={[styles.subtitle]}>Acceso para el envío de notificaciones</Text>
            <Text style={[styles.subtitle, styles.textWhite]}>
              Nap Listener necesita este permiso para validar el servicio de escucha de notificaciones
            </Text>
          </View>
          <Button label="Conceder permiso" size="large" onPress={requestNotificationPermission} />
        </Fragment>
      ) : null}

      {!hasAllowedReadNotifications && hasNotificacionPermission ? (
        <Fragment>
          <View style={{ gap: 32 }}>
            <Text style={[styles.subtitle]}>Además necesitamos acceso a las notificaciones</Text>
            <Text style={[styles.subtitle, styles.textWhite]}>
              Nap Listener necesita este permiso únicamente para detectar confirmaciones de pago provenientes de Yape y automatizar su registro en
              nuestros sistemas internos.
            </Text>
            <Text style={[styles.subtitle, styles.textWhite]}>No leemos mensajes personales ni otras aplicaciones.</Text>
          </View>
          <Button size="large" label="Conceder permiso" onPress={() => openNotificationListenerSettings(false)} />
        </Fragment>
      ) : null}
    </SafeAreaView>
  );
};

export default PermissionsScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#0f172a',
    flex: 1,
    gap: 32,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    textAlign: 'center',
    color: MAIN_COLOR,
  },
  subtitle: {
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 22,
  },
  fullScreen: {
    flex: 1,
    gap: 32,
    borderWidth: 2,
    borderColor: 'red',
  },
  textWhite: {
    fontWeight: '300',
  },
});
