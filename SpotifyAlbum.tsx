import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, Linking, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';

const CLIENT_ID = '';
const CLIENT_SECRET = '';
const SPOTIFY_API_ENDPOINT = 'https://api.spotify.com/v1';

const screenWidth = Dimensions.get('window').width;
const screenHight = Dimensions.get('window').height;
const imageSize = screenWidth * 0.15;
const horizontalSpacing = 5;
const maxImages = Math.floor((screenWidth - horizontalSpacing) / (imageSize + horizontalSpacing)) - 1;

const styles = StyleSheet.create({
  container: {
    flex: .9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumTitle: {
    fontSize: screenHight*.035,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  albumSubTitle: {
    fontSize: screenHight*.02,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '300',
    marginTop: 10,
    marginHorizontal: 10,
  },
  albumImage: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    maxHeight: screenHight *.3,
    maxWidth: screenHight *.3,
    borderRadius: 10,
  },
  albumImageContainerWithShadow: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    maxHeight: screenHight *.3,
    maxWidth: screenHight *.3,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
  playButton: {
    backgroundColor: 'green',
    padding: 10,
    marginBottom: 10,
  },
  playButtonText: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    width: '100%',
  },
  albumItem: {
    alignItems: 'center',
    margin: horizontalSpacing,
  },
  smallAlbumImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: 10,
  },
  smallAlbumTitle: {
    fontSize: screenHight*.01,
    textAlign: 'center',
    marginTop: 5,
    width: imageSize,
    flexWrap: 'wrap',
    overflow: 'hidden',
    maxHeight: 30,
  },
});


const SpotifyAlbum = ({ imageDescription }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [imagePressed, setImagePressed] = useState(false);
  const [soundObject, setSoundObject] = useState(null);
  const [activeAlbum, setActiveAlbum] = useState(albums[0]);
  const [topSongName, setTopSongName] = useState(null);
  const [topSongPreviewURL, setTopSongURL] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      fetchAccessToken();
    } else if (imageDescription) {
      searchAlbums(accessToken, imageDescription);
    }
  }, [accessToken, imageDescription]);

  const fetchAccessToken = async () => {
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    });

    const jsonResponse = await response.json();
    setAccessToken(jsonResponse.access_token);
  };

  const searchAlbums = async (token, query) => {
    const response = await fetch(`${SPOTIFY_API_ENDPOINT}/search?q=${query}&type=album&limit=${maxImages}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const jsonResponse = await response.json();
    setAlbums(jsonResponse.albums.items);
    if (jsonResponse.albums.items.length > 0) {
      setActiveAlbum(jsonResponse.albums.items[0]);
      setTopSong(jsonResponse.albums.items[0].id);
    }
  };

  const getTracks = async (albumId, token) => {
    const response = await fetch(`${SPOTIFY_API_ENDPOINT}/albums/${albumId}/tracks?market=US`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const jsonResponse = await response.json();
    return jsonResponse.items;
  };

  const stopAudio = async () => {
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      setSoundObject(null);
    }
  };

  const handlePlayPress = async (album) => {
    setImagePressed(async (prevState) => {
      const newState = !prevState;
      if (newState && topSongPreviewURL) {
        playSong();
      } else {
        stopAudio();
        setImagePressed(false);
      }

      return newState;
    });
  };

  const setTopSong = async (albumId) => {
    const tracks = await getTracks(albumId, accessToken);
    if (tracks.length > 0) {
      const mostPopularTrack = tracks.reduce((prev, current) => {
        return prev.popularity > current.popularity ? prev : current;
      });
      setTopSongName(mostPopularTrack.track_number + '. ' + mostPopularTrack.name + (mostPopularTrack.preview_url ? '' : ' 🔇'));
      setTopSongURL(mostPopularTrack.preview_url);
    }
  };

  const playSong = async () => {
    if (topSongPreviewURL) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          playInSilentModeIOS: true,
        });
        const { sound } = await Audio.Sound.createAsync({ uri: topSongPreviewURL });
        await sound.playAsync();
        setSoundObject(sound);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            setImagePressed(false);
          }
        });
      } catch (error) {
        console.log('Error playing the song:', error);
      }
    } else {
      console.log('No preview URL available for the most popular track');
    }
  };

  const handleOpenSpotify = (url) => {
    if (url) {
      Linking.openURL(url);
    } else {
      console.log('No Spotify link available for the album');
    }
  };

  const handleAlbumSwtich = (album) => {
    if (imagePressed) {
      stopAudio();
      setImagePressed(false);
    }
    setActiveAlbum(album);
    setTopSong(album.id);
  }

  return (
    <View style={styles.container}>
      {albums.length > 0 && (
        <View style={styles.albumItem}>
          <Text style={styles.albumTitle} numberOfLines={screenHight/284}>{activeAlbum ? activeAlbum.name : albums[0].name}</Text>
          <TouchableOpacity onPress={() => handlePlayPress(activeAlbum ? activeAlbum : albums[0])}>
            <View style={imagePressed && topSongPreviewURL ? styles.albumImageContainerWithShadow : null}>
            <Image
                source={{ uri: activeAlbum ? activeAlbum.images[0].url : albums[0].images[0].url }}
                style={styles.albumImage}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.albumSubTitle} numberOfLines={3}>{topSongName}</Text>
          <TouchableOpacity onPress={() => handleOpenSpotify(activeAlbum ? activeAlbum.external_urls.spotify : albums[0].external_urls.spotify)} style={styles.playButton}>
            <Text style={styles.playButtonText}>Open In Spotify</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.row}>
        {albums.slice(0, maxImages).map((item) => (
          <View key={item.id} style={styles.albumItem}>
            <TouchableOpacity onPress={() => { if (activeAlbum !== item) handleAlbumSwtich(item); }}>
              <Image source={{ uri: item.images[0].url }} style={styles.smallAlbumImage} />
            </TouchableOpacity>
            <Text
              style={styles.smallAlbumTitle}
              numberOfLines={3}
              ellipsizeMode='tail'
            >
              {item.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SpotifyAlbum;
