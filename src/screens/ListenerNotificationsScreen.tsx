import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, NativeModules, NativeEventEmitter, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appsImage, whatsappPackageName, yapePackageName } from '../utils/constants';
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
  const { requestNotificationPermission } = usePermissionsContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allowed, setAllowed] = useState<Array<string>>([]);
  const [listenerEnabled, setListenerEnabled] = useState<boolean>(false);
  const [syncActive, setSyncActive] = useState<boolean>(false);
  const [syncing, setSyncing] = useState(false);

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

    const sub = emitter.addListener('listener_status', status => {
      setSyncActive(status === 'CONNECTED');
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const subscription = emitter.addListener('notifications_changed', () => {
      loadNotifications(true);
    });

    return () => subscription.remove();
  }, []);

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

  const handleCounter = () => {
    counter.value++;
    if (counter.value === 20) {
      handleSetPackages([yapePackageName, whatsappPackageName]);
    }
    if (counter.value === 25) {
      handleSetPackages([yapePackageName]);
    }
  };

  const verifyStatus = async () => {
    try {
      setSyncing(true);

      const ok = await NotificationModule.verifyListener();
      if (!ok) throw new Error('NOT FOUND');

      Alert.alert('OK', 'Listener funcionando correctamente');
    } catch (error: any) {
      Alert.alert(
        'Listener detenido',
        'Se intentó reactivar automáticamente. Si el problema persiste, revisa permisos y batería. ' + String(error.message),
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.permissionBox}>
        <View style={styles.permissionHeader}>
          {Array.from(allowed).length ? (
            <TouchableOpacity style={styles.allowedImgContainer} onPress={handleCounter} activeOpacity={1}>
              {Array.from(allowed).map(item => (
                <Image key={item} src={appsImage[item as keyof typeof appsImage]} style={styles.allowedImg} />
              ))}
            </TouchableOpacity>
          ) : (
            <Text style={styles.textWhite}>Todas las apps en escucha</Text>
          )}
          <View style={styles.allowedImgContainer}>
            <Button loading={syncing} label="Sync" onPress={onSync} />
            <Button loading={syncing} label="Verify" onPress={verifyStatus} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.permissionHeader}>
          <Text style={styles.allowedListLabel}>Permiso para leer notificaciones:</Text>
          <Text style={styles.allowedListLabel}>{listenerEnabled ? '🟢 Activo' : '🔴 Inactivo'}</Text>
          {listenerEnabled ? null : (
            <Button size="small" variant="transparent" label="Activar" onPress={() => NotificationModule.openListenerSettings()} />
          )}
        </View>

        <View style={[styles.permissionHeader, { marginTop: 8 }]}>
          <Text style={styles.allowedListLabel}>Sincronización:</Text>
          <Text style={styles.allowedListLabel}>{syncActive ? '🟢 Activo' : '🔴 Inactivo'}</Text>
          {syncActive ? null : <Button size="small" variant="transparent" label="Activar" onPress={() => NotificationModule.triggerSync()} />}
        </View>
      </View>

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
        ListFooterComponent={loading ? <ActivityIndicator style={styles.indicatorSpacing} /> : null}
      />
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
  textWhite: {
    color: '#ffffff',
  },
  indicatorSpacing: {
    margin: 16,
  },
});
