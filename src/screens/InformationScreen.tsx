import { StyleSheet, Text, View } from 'react-native';
import { MAIN_COLOR } from '../utils/constants';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

interface InformationScreenProps {
  onCheck: () => void;
}

const InformationScreen = ({ onCheck }: InformationScreenProps) => (
  <SafeAreaView style={styles.main_loader_container}>
    <View>
      <Text style={styles.main_loader_title}>Nap Listener</Text>
      <Text style={styles.main_loader_first_paragraph}>Bienvenido</Text>
    </View>
    <Text style={styles.main_loader_second_paragraph}>
      Nap es una herramienta de uso interno para comercios y personal autorizado de Netappperu SAC.
    </Text>

    <Button label="CONTINUAR" onPress={onCheck} />
  </SafeAreaView>
);

export default InformationScreen;

const styles = StyleSheet.create({
  main_loader_container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  main_loader_title: {
    fontSize: 32,
    fontWeight: 700,
    textAlign: 'center',
    color: MAIN_COLOR,
  },
  main_loader_first_paragraph: {
    color: '#FFFfff',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 22,
  },
  main_loader_second_paragraph: {
    color: MAIN_COLOR,
    textAlign: 'center',
    fontSize: 18,
  },
});
