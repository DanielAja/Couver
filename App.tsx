import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import CameraScreen from './CameraScreen';

const { width } = Dimensions.get('window');

export default function App() {
  const [fontsLoaded] = useFonts({
    'Pacifico-Regular': require('./assets/fonts/Pacifico-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Show a loading screen or a placeholder while the font is loading
  }
  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Couver</Text>
      <CameraScreen />
      {/* <GoogleVision /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    top: 50,
    fontSize: width * 0.1, // Change font size based on screen width
    fontWeight: 'bold',
    color: '#ECBD00',
    fontFamily: 'Pacifico-Regular',
    alignSelf: 'center', // Center the title horizontally
    width: '50%', // Set the title width to 50% of the screen
    textAlign: 'center', // Center the title text within the title component
  },
});
