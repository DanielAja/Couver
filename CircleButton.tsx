import React from 'react';
import { TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { Feather } from '@expo/vector-icons';

const CircleButton = ({ onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    Vibration.vibrate(25);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Feather name="camera" size={30} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: '#000',
    borderRadius: 30,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});

export default CircleButton;
