import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { phoneNumberUtils } from '../utils/functions';
import { handleInitializeClient } from '../services/requests';
import { useAppContext } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MAIN_COLOR } from '../utils/constants';

const ValidateClientScreen = () => {
  const { setClient } = useAppContext();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleValidate = async () => {
    try {
      setLoading(true);

      const client = await handleInitializeClient(phoneNumberUtils.clean(value));
      if (!client) throw new Error('Número de celular no registrado o no disponible');

      setClient(client);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <View>
        <Text style={styles.title}>Nap Listener</Text>
        <Text style={styles.subtitle}>Bienvenido</Text>
      </View>

      <Input
        value={value}
        label="Ingrese su número de celular"
        placeholder="987 654 321"
        prefix={<Text style={styles.inputPrefix}>+51</Text>}
        editable={!loading}
        errorMessage={errorMsg}
        onChangeText={raw => {
          setValue(phoneNumberUtils.format(raw));
          setErrorMsg('');
        }}
      />

      <Button label="Continuar" size="large" onPress={handleValidate} loading={loading} disabled={!phoneNumberUtils.valid(value) || !!errorMsg} />
    </SafeAreaView>
  );
};

export default ValidateClientScreen;

const styles = StyleSheet.create({
  container: {
    gap: 32,
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: '#0f172a',
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    textAlign: 'center',
    color: MAIN_COLOR,
  },
  subtitle: {
    color: '#FFFfff',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 22,
  },
  inputPrefix: {
    fontSize: 16,
    color: '#2f2f2f',
  },
});
