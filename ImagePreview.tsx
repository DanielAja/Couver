import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageClassifier from './ImageClassifier';

const { width, height } = Dimensions.get('window');

const ImagePreview = ({ imageUri, onRetakePicture }) => {
  const slideAnimation = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animateIn = () => {
      slideAnimation.setValue(height);
      Animated.timing(slideAnimation, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };
  
    animateIn();
  
    return () => slideAnimation.setValue(height);
  }, []);

  const handleCloseModal = () => {
    Animated.timing(slideAnimation, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onRetakePicture());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: slideAnimation }], { useNativeDriver: false }),
      onPanResponderRelease: (e, { vy }) => {
        if (vy > 0.5) {
          handleCloseModal();
        } else {
          Animated.spring(slideAnimation, {
            toValue: 50,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnimation }] }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.modal}>
        <TouchableOpacity style={styles.exitButton} onPress={handleCloseModal}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <ImageClassifier imageUri={imageUri} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    height: height * 0.95,
    width: width,
    backgroundColor: '#fff',
    borderRadius: 25,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    elevation: 5,
  },
  exitButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    opacity: 0.7,
  },
});

export default ImagePreview;
