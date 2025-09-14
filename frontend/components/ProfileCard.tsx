import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExtraordinaryPerson } from '../screens/ExtraordinaryPeopleScreen';

interface ProfileCardProps {
  profile: ExtraordinaryPerson;
}

export default function ProfileCard({ profile }: ProfileCardProps) {

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.title}>{profile.title}</Text>
          <Text style={styles.company}>{profile.company}</Text>
          <Text style={styles.location}>{profile.location}</Text>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        {profile.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.backstoryContainer}>
        <Text style={styles.backstoryLabel}>Backstory</Text>
        <Text style={styles.backstoryText}>{profile.backstory}</Text>
      </View>

      <View style={styles.achievementsContainer}>
        <Text style={styles.achievementsLabel}>Key Achievements</Text>
        {profile.achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.achievementText}>{achievement}</Text>
          </View>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF4F61',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#888',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E8FF',
  },
  tagText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  backstoryContainer: {
    marginBottom: 16,
  },
  backstoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  backstoryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  achievementsContainer: {
    marginBottom: 16,
  },
  achievementsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    color: '#FF4F61',
    marginRight: 8,
    fontWeight: 'bold',
  },
  achievementText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});
