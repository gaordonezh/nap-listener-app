import React, { useEffect, useState, useCallback, Fragment } from 'react';
import { View, Text, FlatList, ActivityIndicator, NativeModules, NativeEventEmitter, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appsImage, yapePackageName } from '../utils/constants';
import Button from '../components/Button';
import { sleep } from '../utils/functions';
import Empty from '../components/Empty';
import { usePermissionsContext } from '../context/PermissionsContext';

const { NotificationModule } = NativeModules;

const emitter = new NativeEventEmitter(NotificationModule);

type NotificationItem = {
  id: number;
  packageName: string;
  title?: string | null;
  text?: string | null;
  timestamp: number;
  eventType: string;
};

const counter = { value: 0 };

const ListenerNotificationsScreen = () => {
  const { requestNotificationPermission, openNotificationListenerSettings } = usePermissionsContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allowed, setAllowed] = useState<Array<string>>([]);
  const [listenerEnabled, setListenerEnabled] = useState<boolean>(true);
  const [syncActive, setSyncActive] = useState<boolean>(true);
  const [syncing, setSyncing] = useState(false);
  const [listenerLoading, setListenerLoading] = useState(false);

  const loadNotifications = useCallback(
    async (reset?: boolean) => {
      if (loading) return;

      setLoading(true);

      try {
        const currentOffset = reset ? 0 : offset;

        const data: NotificationItem[] = await NotificationModule.getNotifications(20, currentOffset);

        setNotifications(prev => (reset ? data : [...prev, ...data]));

        setOffset(currentOffset + data.length);
      } catch (e) {
        console.error('Error cargando notificaciones', e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [offset, loading],
  );

  useEffect(() => {
    initAllowedApps();
    loadStatus();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const sub = emitter.addListener('listener_status', status => {
      setSyncActive(status === 'CONNECTED');
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    const subscription = emitter.addListener('notifications_changed', () => {
      loadNotifications(true);
    });

    return () => subscription.remove();
  }, []);

  const loadStatus = async () => {
    try {
      setListenerLoading(true);
      const [sync, listener] = await Promise.all([NotificationModule.isSyncActive(), NotificationModule.verifyListener()]);
      setListenerEnabled(listener);
      setSyncActive(sync);
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar los permisos');
    } finally {
      setListenerLoading(false);
    }
  };

  const initAllowedApps = async () => {
    const res: Array<string> = await NotificationModule.getAllowedPackages();
    if (res.length) handleSetPackages(res);
    else handleSetPackages([yapePackageName]);
  };

  const handleSetPackages = (pkgs: Array<string>) => {
    setAllowed(pkgs);
    NotificationModule.setAllowedPackages(pkgs);
  };

  const onSync = async () => {
    try {
      setSyncing(true);
      await Promise.all([NotificationModule.syncNow(), sleep(1000)]);
      Alert.alert('Sincronización', 'Envío iniciado');
    } catch {
      Alert.alert('Error', 'No se pudo sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const getLabelStatus = (status: boolean) => {
    if (listenerLoading) return '🟡 Pendiente';
    if (status) return '🟢 Activo';
    return '🔴 Inactivo';
  };

  const hasWarning = !listenerEnabled || !syncActive;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.permissionBox, hasWarning ? styles.permissionBoxWarning : {}]}>
        <View style={styles.permissionHeader}>
          {Array.from(allowed).length ? (
            <TouchableOpacity style={styles.allowedImgContainer} activeOpacity={1}>
              {Array.from(allowed).map(item => (
                <Image key={item} src={appsImage[item as keyof typeof appsImage]} style={styles.allowedImg} />
              ))}
            </TouchableOpacity>
          ) : (
            <Text style={styles.textWhite}>All Apps</Text>
          )}
          <View style={styles.allowedImgContainer}>
            <Button loading={syncing || listenerLoading} label="Sync" onPress={onSync} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.permissionHeader}>
          <View style={styles.flex1}>
            {listenerEnabled ? (
              <Text style={styles.allowedListLabel}>Escucha de notificaciones:</Text>
            ) : (
              <Fragment>
                <Text style={styles.allowedListLabel}>⚠️ Nap Listener dejó de tener acceso a las notificaciones ⚠️</Text>
                <Text style={styles.allowedListLabelWarning}>Android detuvo el acceso a notificaciones</Text>
                <Text style={[styles.allowedListLabelInfo, { marginTop: 8 }]}>Recomendaciones:</Text>
                <Text style={styles.allowedListLabelInfo}>— Excluir la app de optimización de batería</Text>
                <Text style={styles.allowedListLabelInfo}>— Permitir ejecución en segundo plano</Text>
                <Text style={styles.allowedListLabelInfo}>— No "limpiar apps" manualmente</Text>
              </Fragment>
            )}
          </View>

          {listenerEnabled ? (
            <Text style={styles.allowedListLabel}>{getLabelStatus(listenerEnabled)}</Text>
          ) : (
            <Button size="small" variant="outlined" label="Activar" color="warning" onPress={() => openNotificationListenerSettings(true)} />
          )}
        </View>

        {listenerEnabled ? null : <View style={styles.divider} />}

        <View style={[styles.permissionHeader]}>
          <Text style={styles.allowedListLabel}>Sincronización:</Text>
          <Text style={styles.allowedListLabel}>{getLabelStatus(syncActive)}</Text>
        </View>
      </View>

      <FlatList
        style={styles.cardContainer}
        data={notifications}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{item.title || '—'}</Text>
              <Text style={styles.event}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <Text style={styles.text}>{item.text || '—'}</Text>
            <Text style={styles.app}>{item.packageName}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Empty title="No hay notificaciones registradas" />
          </View>
        }
        onEndReached={() => loadNotifications()}
        onEndReachedThreshold={0.7}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadNotifications(true);
        }}
        ListFooterComponent={loading ? <ActivityIndicator style={styles.indicatorSpacing} /> : null}
      />
    </SafeAreaView>
  );
};

export default ListenerNotificationsScreen;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#2f2f2f',
    marginTop: 16,
    marginBottom: 16,
  },
  permissionBox: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  permissionBoxWarning: {
    backgroundColor: '#D9770625',
    borderColor: '#D9770675',
  },
  permissionHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionTitle: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: '700',
  },
  allowedImgContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
  },
  allowedImg: {
    height: 40,
    width: 40,
    borderRadius: 4,
  },
  allowedListLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  allowedListLabelWarning: {
    fontSize: 12,
    color: '#fff200',
  },
  allowedListLabelInfo: {
    fontSize: 12,
    color: '#6e7fb1',
  },
  permissionText: {
    color: '#cbd5f5',
    marginVertical: 16,
  },
  emptyContainer: {
    paddingVertical: 60,
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
  },
  card: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  app: {
    color: '#38bdf8',
    fontSize: 10,
  },
  event: {
    color: '#94a3b8',
    fontSize: 11,
  },
  title: {
    color: '#e5e7eb',
    fontSize: 16,
    marginTop: 4,
    fontWeight: '600',
  },
  text: {
    color: '#cbd5f5',
    marginTop: 2,
  },
  textWhite: {
    color: '#ffffff',
  },
  indicatorSpacing: {
    margin: 16,
  },
});
