import { Text, View, Image, StyleProp, TextStyle, StyleSheet } from 'react-native';

interface EmptyProps {
  title?: string;
  textStyle?: StyleProp<TextStyle>;
}

const Empty = ({ title = 'No hay datos', textStyle }: EmptyProps) => (
  <View style={styles.empty_container}>
    <Image source={require('../assets/empty_icon.jpg')} style={styles.empty_image} />
    <Text style={[styles.empty_text, textStyle]}>{title}</Text>
  </View>
);

export default Empty;

const styles = StyleSheet.create({
  empty_container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  empty_image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  empty_text: {
    fontSize: 14,
    fontWeight: '300',
    textAlign: 'center',
    color: '#757575',
  },
});
