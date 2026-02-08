import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MAIN_COLOR } from '../utils/constants';

const LoaderScreen = () => {
  return (
    <View style={styles.main_loader_container}>
      <View>
        <Text style={styles.main_loader_title}>Nap Listener</Text>
        <Text style={styles.main_loader_first_paragraph}>Bienvenido</Text>
      </View>
      <ActivityIndicator size={75} color={MAIN_COLOR} />
      <View>
        <Text style={styles.main_loader_first_paragraph}>Espere...</Text>
        <Text style={styles.main_loader_second_paragraph}>Estamos cargando la información para tí.</Text>
      </View>
    </View>
  );
};

export default LoaderScreen;

const styles = StyleSheet.create({
  main_loader_container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
