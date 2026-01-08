import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { phoneNumberUtils } from '../utils/functions';
import { handleGetClientData } from '../services/requests';
import { useAppContext } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ValidateClientScreen = () => {
  const { setClient } = useAppContext();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { height } = useWindowDimensions();

  const handleValidate = async () => {
    try {
      setLoading(true);

      const client = await handleGetClientData(phoneNumberUtils.clean(value));
      if (!client) throw new Error('Número de celular no registrado');

      setClient(client);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { height }]}>
      <ScrollView>
        <View style={{ flex: 1, gap: 32 }}>
          <View style={{ height: height - 500 }}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ValidateClientScreen;

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
  inputPrefix: {
    fontSize: 16,
    color: '#2f2f2f',
  },
});
