import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  increment,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { UserToRate } from '../types';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = width - 60;

export default function RateScreen() {
  const [currentUser, setCurrentUser] = useState<UserToRate | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [noMoreUsers, setNoMoreUsers] = useState(false);
  const [ratedUserIds, setRatedUserIds] = useState<string[]>([]);
  const { user, userData, refreshUserData } = useAuth();

  const fetchNextUser = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get list of users already rated by current user
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const currentUserData = userDoc.data();
      const alreadyRated = currentUserData?.ratedUsers || [];
      setRatedUserIds(alreadyRated);

      // Get users with completed profiles that haven't been rated
      const usersQuery = query(
        collection(db, 'users'),
        where('hasCompletedProfile', '==', true)
      );

      const snapshot = await getDocs(usersQuery);
      const availableUsers: UserToRate[] = [];

      snapshot.forEach(docSnap => {
        if (docSnap.id !== user.uid && !alreadyRated.includes(docSnap.id)) {
          const data = docSnap.data();
          if (data.photos && data.photos.length >= 3) {
            availableUsers.push({
              id: docSnap.id,
              photos: data.photos,
            });
          }
        }
      });

      if (availableUsers.length > 0) {
        // Pick a random user
        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        setCurrentUser(availableUsers[randomIndex]);
        setCurrentPhotoIndex(0);
        setNoMoreUsers(false);
      } else {
        setCurrentUser(null);
        setNoMoreUsers(true);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNextUser();
  }, [fetchNextUser]);

  const submitRating = async (score: number) => {
    if (!user || !currentUser) return;

    setSubmitting(true);
    try {
      // Add rating to the rated user
      await updateDoc(doc(db, 'users', currentUser.id), {
        ratingsReceived: arrayUnion({
          raterId: user.uid,
          score,
          createdAt: new Date(),
        }),
      });

      // Update current user's rating count and rated users list
      await updateDoc(doc(db, 'users', user.uid), {
        ratingsGiven: increment(1),
        ratedUsers: arrayUnion(currentUser.id),
      });

      // Recalculate average for rated user
      const ratedUserDoc = await getDoc(doc(db, 'users', currentUser.id));
      const ratedUserData = ratedUserDoc.data();
      if (ratedUserData?.ratingsReceived) {
        const ratings = ratedUserData.ratingsReceived;
        const total = ratings.reduce((sum: number, r: any) => sum + r.score, 0);
        const average = total / ratings.length;
        await updateDoc(doc(db, 'users', currentUser.id), {
          averageRating: Math.round(average * 10) / 10,
        });
      }

      await refreshUserData();
      fetchNextUser();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRatingButtons = () => {
    const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return (
      <View style={styles.ratingsContainer}>
        {ratings.map(rating => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              rating <= 3 && styles.ratingLow,
              rating >= 4 && rating <= 6 && styles.ratingMedium,
              rating >= 7 && styles.ratingHigh,
            ]}
            onPress={() => submitRating(rating)}
            disabled={submitting}
          >
            <Text style={styles.ratingText}>{rating}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </LinearGradient>
    );
  }

  if (noMoreUsers) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Bravo !</Text>
          <Text style={styles.emptyText}>
            Tu as noté tous les profils disponibles pour le moment.
            {'\n\n'}Reviens plus tard pour découvrir de nouveaux utilisateurs !
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchNextUser}>
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Note ce profil</Text>
          <Text style={styles.subtitle}>
            {userData?.ratingsGiven || 0}/3 notes données
            {(userData?.ratingsGiven || 0) < 3 && '\nNote encore pour voir ta note !'}
          </Text>
        </View>

        {currentUser && (
          <>
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: currentUser.photos[currentPhotoIndex] }}
                style={styles.mainPhoto}
              />
            </View>

            <View style={styles.thumbnailsContainer}>
              {currentUser.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentPhotoIndex(index)}
                  style={[
                    styles.thumbnail,
                    currentPhotoIndex === index && styles.thumbnailActive,
                  ]}
                >
                  <Image source={{ uri: photo }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.rateLabel}>Ta note :</Text>
            {submitting ? (
              <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />
            ) : (
              renderRatingButtons()
            )}
          </>
        )}
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#fff',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  rateLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 25,
    marginBottom: 15,
  },
  ratingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLow: {
    backgroundColor: '#ff6b6b',
  },
  ratingMedium: {
    backgroundColor: '#ffd93d',
  },
  ratingHigh: {
    backgroundColor: '#6bcb77',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  refreshButton: {
    marginTop: 30,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});
