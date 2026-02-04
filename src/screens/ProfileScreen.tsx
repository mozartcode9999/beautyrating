import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const MIN_RATINGS_REQUIRED = 3;

export default function ProfileScreen() {
  const { userData, signOut, refreshUserData } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    refreshUserData();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const canSeeRating = (userData?.ratingsGiven || 0) >= MIN_RATINGS_REQUIRED;
  const hasRatings = userData?.ratingsReceived && userData.ratingsReceived.length > 0;

  const getRatingColor = (rating: number) => {
    if (rating < 4) return '#ff6b6b';
    if (rating < 7) return '#ffd93d';
    return '#6bcb77';
  };

  const getRatingEmoji = (rating: number) => {
    if (rating >= 9) return '🔥';
    if (rating >= 7) return '😍';
    if (rating >= 5) return '😊';
    if (rating >= 3) return '😐';
    return '😅';
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Mon Profil</Text>
        </View>

        {/* Photos */}
        {userData?.photos && userData.photos.length > 0 && (
          <View style={styles.photosSection}>
            <View style={styles.mainPhotoContainer}>
              <Image
                source={{ uri: userData.photos[selectedPhoto] }}
                style={styles.mainPhoto}
              />
            </View>
            <View style={styles.thumbnailsRow}>
              {userData.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedPhoto(index)}
                  style={[
                    styles.thumbnail,
                    selectedPhoto === index && styles.thumbnailActive,
                  ]}
                >
                  <Image source={{ uri: photo }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          {!canSeeRating ? (
            <View style={styles.lockedContainer}>
              <Text style={styles.lockedIcon}>🔒</Text>
              <Text style={styles.lockedTitle}>Note verrouillée</Text>
              <Text style={styles.lockedText}>
                Note encore {MIN_RATINGS_REQUIRED - (userData?.ratingsGiven || 0)} profil(s)
                pour débloquer ta note !
              </Text>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${((userData?.ratingsGiven || 0) / MIN_RATINGS_REQUIRED) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {userData?.ratingsGiven || 0} / {MIN_RATINGS_REQUIRED}
              </Text>
            </View>
          ) : !hasRatings ? (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingIcon}>⏳</Text>
              <Text style={styles.waitingTitle}>En attente de notes</Text>
              <Text style={styles.waitingText}>
                Tu n'as pas encore reçu de notes.{'\n'}
                Patiente, la communauté va bientôt te noter !
              </Text>
            </View>
          ) : (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Ta note de beauté</Text>
              <View
                style={[
                  styles.scoreBadge,
                  { backgroundColor: getRatingColor(userData.averageRating || 0) },
                ]}
              >
                <Text style={styles.scoreValue}>
                  {userData.averageRating?.toFixed(1)}
                </Text>
                <Text style={styles.scoreMax}>/10</Text>
              </View>
              <Text style={styles.scoreEmoji}>
                {getRatingEmoji(userData.averageRating || 0)}
              </Text>
              <Text style={styles.votesCount}>
                Basé sur {userData.ratingsReceived.length} vote(s)
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userData?.ratingsGiven || 0}</Text>
            <Text style={styles.statLabel}>Notes données</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {userData?.ratingsReceived?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Notes reçues</Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
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
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  photosSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  mainPhotoContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
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
  thumbnailsRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  thumbnailActive: {
    borderColor: '#fff',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  ratingSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },
  lockedContainer: {
    alignItems: 'center',
  },
  lockedIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  lockedText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6bcb77',
    borderRadius: 5,
  },
  progressText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: '600',
  },
  waitingContainer: {
    alignItems: 'center',
  },
  waitingIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  waitingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  waitingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreMax: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 5,
  },
  scoreEmoji: {
    fontSize: 40,
    marginTop: 15,
  },
  votesCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
