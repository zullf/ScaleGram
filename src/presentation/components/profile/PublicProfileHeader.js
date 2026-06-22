import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import UserAvatar from '../common/UserAvatar';
import ProfileStat from './ProfileStat';
import { createHandle } from './profileFormatters';

const PURPLE = '#6366F1';

export default function PublicProfileHeader({
  colors = {},
  profileUser,
  postsCount,
  followersCount,
  followingCount,
  isOwnProfile,
  isFollowing,
  followLoading,
  onToggleFollow,
  onFollowersPress,
  onFollowingPress,
}) {
  return (
    <View>
      <View style={[styles.profileSection, { backgroundColor: colors.card || '#FFFFFF' }]}>
        <View style={styles.profileTopRow}>
          <View style={[styles.avatarRing, { backgroundColor: colors.card || '#FFFFFF' }]}>
            <UserAvatar name={profileUser.displayName} uri={profileUser.photoURL} size={86} />
          </View>

          <View style={styles.statsRow}>
            <ProfileStat value={String(postsCount)} label="Posts" colors={colors} />
            <ProfileStat
              value={String(followersCount)}
              label="Followers"
              colors={colors}
              onPress={onFollowersPress}
            />
            <ProfileStat
              value={String(followingCount)}
              label="Following"
              colors={colors}
              onPress={onFollowingPress}
            />
          </View>
        </View>

        <View style={styles.bioBlock}>
          <Text style={[styles.displayName, { color: colors.text || '#111827' }]}>
            {profileUser.displayName}
          </Text>
          <Text style={[styles.userHandle, { color: colors.mutedText || '#6B7280' }]}>
            @{createHandle(profileUser.displayName || profileUser.id)}
          </Text>
          {profileUser.bio || profileUser.email ? (
            <Text style={[styles.bioText, { color: colors.text || '#111827' }]}>
              {profileUser.bio || profileUser.email}
            </Text>
          ) : null}
        </View>

        {!isOwnProfile ? (
          <FollowButton
            colors={colors}
            isFollowing={isFollowing}
            loading={followLoading}
            onPress={onToggleFollow}
          />
        ) : null}
      </View>

      <View
        style={[
          styles.postsTab,
          {
            backgroundColor: colors.card || '#FFFFFF',
            borderTopColor: colors.border || '#E5E7EB',
            borderBottomColor: colors.border || '#E5E7EB',
          },
        ]}
      >
        <Ionicons name="grid-outline" size={20} color={PURPLE} />
        <Text style={styles.postsTabText}>Postingan</Text>
      </View>
    </View>
  );
}

function FollowButton({ colors, isFollowing, loading, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.followButton,
        isFollowing && styles.followingButton,
        {
          borderColor: isFollowing ? colors.border || '#D1D5DB' : PURPLE,
          backgroundColor: isFollowing ? colors.card || '#FFFFFF' : PURPLE,
        },
      ]}
      activeOpacity={0.78}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFollowing ? PURPLE : '#FFFFFF'} />
      ) : (
        <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 18,
  },
  bioBlock: {
    marginTop: 14,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '800',
  },
  userHandle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  followButton: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    backgroundColor: PURPLE,
  },
  followingButton: {
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  followingButtonText: {
    color: PURPLE,
  },
  postsTab: {
    height: 50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  postsTabText: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '800',
  },
});
