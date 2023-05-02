import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';

import SpotifyAlbum from './SpotifyAlbum';

const GOOGLE_VISION_API_KEY = '';

const convertImageToBase64 = async (uri) => {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return base64;
};

const ImageClassifier = ({ imageUri }) => {
  const [imageDescription, setImageDescription] = useState(null);

  const analyzeImage = async () => {
    const base64Image = await convertImageToBase64(imageUri);

    const body = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "WEB_DETECTION",
            },
          ],
        },
      ],
    };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const jsonResponse = await response.json();
    console.log(jsonResponse.responses[0].webDetection.bestGuessLabels[0].label);
    setImageDescription(jsonResponse.responses[0].webDetection.bestGuessLabels[0].label);
  };

  useEffect(() => {
    analyzeImage();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {imageDescription ? (
        <View>
          <SpotifyAlbum imageDescription={imageDescription} />
        </View>
      ) : (
        <ActivityIndicator size="large" color="#ECBD00" />
      )}
    </View>
  );
};

export default ImageClassifier;
