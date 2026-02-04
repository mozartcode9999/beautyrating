import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function UploadScreen() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user, refreshUserData } = useAuth();

  const pickImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "L'accès à vos photos est nécessaire");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const uploadPhotos = async () => {
    if (photos.filter(p => p).length < 3) {
      Alert.alert('Erreur', 'Veuillez sélectionner 3 photos');
      return;
    }

    if (!user) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const response = await fetch(photos[i]);
        const blob = await response.blob();
        const filename = `users/${user.uid}/photo_${i}_${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        photos: uploadedUrls,
        hasCompletedProfile: true,
      });

      await refreshUserData();
      Alert.alert('Succès', 'Vos photos ont été uploadées !');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Erreur', "Une erreur est survenue lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const renderPhotoSlot = (index: number) => {
    const photo = photos[index];
    return (
      <TouchableOpacity
        key={index}
        style={styles.photoSlot}
        onPress={() => pickImage(index)}
        disabled={uploading}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.plusIcon}>+</Text>
            <Text style={styles.placeholderText}>Selfie {index + 1}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Tes selfies</Text>
          <Text style={styles.subtitle}>
            Ajoute 3 photos de toi pour être noté(e) par la communauté
          </Text>
        </View>

        <View style={styles.photosContainer}>
          {[0, 1, 2].map(index => renderPhotoSlot(index))}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Conseils pour de meilleures notes :</Text>
          <Text style={styles.tip}>- Bonne luminosité</Text>
          <Text style={styles.tip}>- Visage bien visible</Text>
          <Text style={styles.tip}>- Photos récentes</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.uploadButton,
            photos.filter(p => p).length < 3 && styles.uploadButtonDisabled,
          ]}
          onPress={uploadPhotos}
          disabled={uploading || photos.filter(p => p).length < 3}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Valider mes photos</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  photosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
    borderRadius: 15,
  },
  plusIcon: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '300',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginVertical: 3,
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '700',
  },
});
