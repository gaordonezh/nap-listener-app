import React, { useEffect, useState, useCallback, Fragment } from 'react';
import { View, Text, FlatList, ActivityIndicator, NativeModules, NativeEventEmitter, StyleSheet, AppState, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appsImage, whatsappPackageName, yapePackageName } from '../utils/constants';
import Button from '../components/Button';
import { sleep } from '../utils/functions';
import Empty from '../components/Empty';

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

const counters = { first: 0, second: 0 };

const ListenerNotificationsScreen = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [allowed, setAllowed] = useState<Array<string>>([]);
  const [listenerEnabled, setListenerEnabled] = useState<boolean>(false);
  const [syncActive, setSyncActive] = useState<boolean>(false);
  const [syncing, setSyncing] = useState(false);

  const checkPermission = useCallback(async () => {
    try {
      const granted = await NotificationModule.hasNotificationPermission();
      setHasPermission(granted);
      loadNotifications(true, granted);
    } catch (e) {
      console.error('Error verificando permiso', e);
    }
  }, []);

  const loadNotifications = useCallback(
    async (reset?: boolean, defaultPerms?: boolean) => {
      const perms = typeof defaultPerms === 'boolean' ? defaultPerms : hasPermission;
      if (loading || !perms) return;

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
    [offset, loading, hasPermission],
  );

  useEffect(() => {
    initAllowedApps();
    loadStatus();

    const sub = emitter.addListener('listener_status', status => {
      setSyncActive(status === 'CONNECTED');
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        checkPermission();
        loadNotifications(true);
      }
    });

    return () => sub.remove();
  }, [checkPermission, loadNotifications]);

  useEffect(() => {
    const subscription = emitter.addListener('notifications_changed', () => {
      loadNotifications(true);
    });

    return () => subscription.remove();
  }, [loadNotifications]);

  const loadStatus = async () => {
    const listener = await NotificationModule.isListenerEnabled();
    const sync = await NotificationModule.isSyncActive();

    setSyncActive(sync);
    setListenerEnabled(listener);
  };

  const initAllowedApps = async () => {
    // await handleSetPackages([]);
    await handleSetPackages([yapePackageName]);
    // const res: Array<string> = await NotificationModule.getAllowedPackages();
  };

  const handleSetPackages = async (pkgs: Array<string>) => {
    setAllowed(pkgs);
    await NotificationModule.setAllowedPackages(pkgs);
  };

  const onSync = async () => {
    try {
      setSyncing(true);
      await NotificationModule.syncNow();
      await sleep(1000);
      Alert.alert('Sincronización', 'Envío iniciado');
    } catch {
      Alert.alert('Error', 'No se pudo sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const handleCounter = (key: keyof typeof counters) => {
    counters[key]++;

    if (counters.first === 5 && counters.second === 5) {
      handleSetPackages([yapePackageName, whatsappPackageName]);
    }
    if (counters.first > 5 && counters.second > 5) {
      handleSetPackages([yapePackageName]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.permissionBox}>
        {hasPermission ? (
          <Fragment>
            <View style={styles.permissionHeader}>
              {Array.from(allowed).length ? (
                <View style={styles.allowedImgContainer}>
                  {Array.from(allowed).map(item => (
                    <Image key={item} src={appsImage[item as keyof typeof appsImage]} style={styles.allowedImg} />
                  ))}
                </View>
              ) : (
                <Text style={{ color: '#fff' }}>Todas las apps en escucha</Text>
              )}
              <Button loading={syncing} label="Force Sync" onPress={onSync} />
            </View>

            <View style={styles.divider} />

            <View style={styles.permissionHeader}>
              <Text style={styles.allowedListLabel} onPress={() => handleCounter('first')}>
                Listener:
              </Text>
              <Text style={styles.allowedListLabel}>{listenerEnabled ? '🟢 Activo' : '🔴 Inactivo'}</Text>
              {listenerEnabled ? null : (
                <Button size="small" variant="transparent" label="Activar" onPress={() => NotificationModule.openListenerSettings()} />
              )}
            </View>

            <View style={[styles.permissionHeader, { marginTop: 8 }]}>
              <Text style={styles.allowedListLabel} onPress={() => handleCounter('second')}>
                Sincronización:
              </Text>
              <Text style={styles.allowedListLabel}>{syncActive ? '🟢 Activo' : '🔴 Inactivo'}</Text>
              {syncActive ? null : <Button size="small" variant="transparent" label="Activar" onPress={() => NotificationModule.triggerSync()} />}
            </View>
          </Fragment>
        ) : (
          <Fragment>
            <Text style={styles.permissionTitle}>Permiso requerido</Text>
            <Text style={styles.permissionText}>NapListener necesita acceso a las notificaciones para funcionar correctamente.</Text>

            <Button size="large" label="Conceder permiso" onPress={() => NotificationModule.openNotificationSettings()} />
          </Fragment>
        )}
      </View>

      {hasPermission ? (
        <FlatList
          style={styles.cardContainer}
          data={notifications}
          keyExtractor={item => item.id.toString()}
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
          ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
        />
      ) : null}
    </SafeAreaView>
  );
};

export default ListenerNotificationsScreen;

const styles = StyleSheet.create({
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
    fontSize: 14,
    color: '#ffffff',
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
});
