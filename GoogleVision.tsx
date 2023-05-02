import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';


const GOOGLE_VISION_API_KEY = '';

const convertImageToBase64 = async (uri) => {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return base64;
};


const GoogleVision = () => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const analyzeImage = async () => {
    const base64Image = await convertImageToBase64(image);

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
    console.log(jsonResponse);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity onPress={pickImage}>
        <Text>Pick an image</Text>
      </TouchableOpacity>
      {image && (
        <>
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
          <TouchableOpacity onPress={analyzeImage}>
            <Text>Analyze image</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default GoogleVision;
