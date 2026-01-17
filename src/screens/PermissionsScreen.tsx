import React, { Fragment } from 'react';
import { NativeModules, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { usePermissionsContext } from '../context/PermissionsContext';

const PermissionsScreen = () => {
  const { hasAllowedReadNotifications, hasNotificacionPermission, requestNotificationPermission } = usePermissionsContext();
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={[styles.container, { height }]}>
      <ScrollView>
        <View style={styles.fullScreen}>
          <View style={[{ height: height - 500 }]}>
            <Text style={styles.title}>Nap Listener</Text>
            <Text style={styles.subtitle}>Bienvenido</Text>
          </View>

          {!hasNotificacionPermission ? (
            <Fragment>
              <Text style={[styles.subtitle, styles.textWhite]}>Necesitamos acceso a las notificaciones de Yape para continuar...</Text>
              <Button label="Conceder permiso" size="large" onPress={requestNotificationPermission} />
            </Fragment>
          ) : null}

          {!hasAllowedReadNotifications && hasNotificacionPermission ? (
            <Fragment>
              <Text style={[styles.subtitle, styles.textWhite]}>
                Además, necesitamos permiso para leer las notificaciones de Yape para continuar...
              </Text>
              <Button size="large" label="Conceder permiso" onPress={() => NativeModules.NotificationModule.openNotificationSettings()} />
            </Fragment>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PermissionsScreen;

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
    fontWeight: 600,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#aaa',
    textAlign: 'center',
    fontWeight: 300,
  },
  fullScreen: {
    flex: 1,
    gap: 32,
  },
  textWhite: {
    color: '#ffffff',
  },
});
