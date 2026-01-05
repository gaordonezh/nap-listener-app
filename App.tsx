import React, { useEffect, useState, useCallback, Fragment } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  NativeModules,
  NativeEventEmitter,
  StyleSheet,
  AppState,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { defaultAllowedApps } from './src/utils/constants';
import Button from './src/components/Button';

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

const PAGE_SIZE = 20;

export default function App() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [allowed, setAllowed] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);

  const checkPermission = useCallback(async () => {
    try {
      const granted = await NotificationModule.hasNotificationPermission();
      setHasPermission(granted);
      if (granted) {
        loadNotifications(true);
      }
    } catch (e) {
      console.error('Error verificando permiso', e);
    }
  }, []);

  const openPermissionSettings = () => {
    NotificationModule.openNotificationSettings();
  };

  const loadNotifications = useCallback(
    async (reset: boolean = false) => {
      if (loading || hasPermission === false) return;

      setLoading(true);

      try {
        const currentOffset = reset ? 0 : offset;

        const data: NotificationItem[] =
          await NotificationModule.getNotifications(PAGE_SIZE, currentOffset);

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
    handleSetPackages([]);
    // handleSetPackages(defaultAllowedApps.map(item => item.package));

    const sub = emitter.addListener('listenerStatus', status => {
      console.log('Listener status:', status);
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
    const emitter = new NativeEventEmitter(NotificationModule);

    const subscription = emitter.addListener('notifications_changed', () => {
      loadNotifications(true);
    });

    return () => subscription.remove();
  }, [loadNotifications]);

  const handleSetPackages = (pkgs: Array<string>) => {
    const next = new Set(allowed);

    for (const pkg of pkgs) {
      if (next.has(pkg)) next.delete(pkg);
      else next.add(pkg);
    }

    setAllowed(next);
    NotificationModule.setAllowedPackages(Array.from(next));
  };

  const getAppName = (pkg: string): string => {
    const finder = defaultAllowedApps.find(item => item.package === pkg);
    if (!finder) return pkg;
    return finder.name;
  };

  const onSync = async () => {
    try {
      setSyncing(true);
      await NotificationModule.triggerSync();
      await new Promise(resolve => setTimeout(() => resolve(true), 1000));
      Alert.alert('Sincronización', 'Envío iniciado');
    } catch {
      Alert.alert('Error', 'No se pudo sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.permissionBox}>
        {hasPermission ? (
          <Fragment>
            <View style={styles.permissionHeader}>
              <Text style={styles.permissionTitle}>Apps a la escucha</Text>
              <Button loading={syncing} label="Force Sync" onPress={onSync} />
            </View>

            <View style={styles.allowedContainer}>
              {defaultAllowedApps.map((item, index) => (
                <View key={index + 1} style={styles.allowedList}>
                  <Image src={item.imgUrl} style={styles.allowedImg} />
                  <Text style={styles.allowedListLabel}>{item.name}</Text>
                  <Switch
                    value={allowed.has(item.package)}
                    onValueChange={() => handleSetPackages([item.package])}
                  />
                </View>
              ))}
            </View>
          </Fragment>
        ) : (
          <Fragment>
            <Text style={styles.permissionTitle}>Permiso requerido</Text>
            <Text style={styles.permissionText}>
              NapListener necesita acceso a las notificaciones para funcionar
              correctamente.
            </Text>

            <Button
              size="large"
              label="Conceder permiso"
              onPress={openPermissionSettings}
            />
          </Fragment>
        )}
      </View>

      {hasPermission ? (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>{item.title || '—'}</Text>
                <Text style={styles.event}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.text}>{item.text || '—'}</Text>
              <Text style={styles.app}>{getAppName(item.packageName)}</Text>
            </View>
          )}
          onEndReached={() => loadNotifications()}
          onEndReachedThreshold={0.7}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadNotifications(true);
          }}
          ListFooterComponent={
            loading ? <ActivityIndicator style={{ margin: 16 }} /> : null
          }
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  permissionBox: {
    padding: 24,
    margin: 24,
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
  allowedContainer: {
    marginTop: 20,
    paddingTop: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#2f2f2f',
  },
  allowedList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allowedImg: {
    height: 25,
    width: 25,
    borderRadius: 4,
  },
  allowedListLabel: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  permissionText: {
    color: '#cbd5f5',
    marginVertical: 16,
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
    fontSize: 12,
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
