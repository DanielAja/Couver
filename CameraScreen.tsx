import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Camera } from 'expo-camera';
import CircleButton from './CircleButton';
import ImagePreview from './ImagePreview.tsx';

const { width } = Dimensions.get('window');

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakePicture = async () => {
    if (cameraRef) {
      const { uri } = await cameraRef.takePictureAsync();
      setImageUri(uri);
    }
  };

  const handleRetakePicture = () => {
    setImageUri(null);
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={ref => {
            setCameraRef(ref);
          }}
          style={styles.camera}
          type={Camera.Constants.Type.back}
        />
        {/* <SpotifyAlbum imageDescription={"The Doors"} /> */}
        <CircleButton onPress={handleTakePicture} />
      </View>
      {imageUri && (
        <View style={styles.previewContainer}>
          
          <ImagePreview imageUri={imageUri} onRetakePicture={handleRetakePicture} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: width * 0.8,
    aspectRatio: 1,
  },
  previewContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});

export default CameraScreen;
