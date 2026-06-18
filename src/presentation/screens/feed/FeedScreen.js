import React from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeed } from '../../hooks/useFeed';
import { timeAgo } from '../../../utils/timeFormat';

const PURPLE = '#6366F1';
const logoImage = require('../../../../assets/logo.jpg');

const creators = [
  {
    id: 'creator-1',
    name: 'Felix R.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'creator-2',
    name: 'Sarah J.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'creator-3',
    name: 'Marcus K.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'creator-4',
    name: 'Elena M.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'creator-5',
    name: 'Leo P.',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'creator-6',
    name: 'Alya N.',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'creator-7',
    name: 'Raka D.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'creator-8',
    name: 'Maya C.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  },
];

function FeedHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerBar, { height: 64 + insets.top, paddingTop: insets.top }]}>
      <View style={styles.headerBrandRow}>
        <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
          <Ionicons name="menu-outline" size={24} color={PURPLE} />
        </TouchableOpacity>

        <Image source={logoImage} style={styles.headerLogo} contentFit="contain" />
      </View>
    </View>
  );
}

function FeaturedCreators() {
  return (
    <View style={styles.featuredSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Creators</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.creatorList}
      >
        {creators.map((creator) => (
          <CreatorItem key={creator.id} creator={creator} />
        ))}
      </ScrollView>
    </View>
  );
}

const CreatorItem = React.memo(function CreatorItem({ creator }) {
  return (
    <TouchableOpacity style={styles.creatorItem} activeOpacity={0.78}>
      <View style={styles.creatorAvatarRing}>
        <Image source={{ uri: creator.avatar }} style={styles.creatorAvatar} contentFit="cover" />
      </View>
      <Text style={styles.creatorName} numberOfLines={1}>
        {creator.name}
      </Text>
    </TouchableOpacity>
  );
});

const PostCard = React.memo(function PostCard({ post, onLike }) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.userAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' }} style={styles.userAvatar} contentFit="cover" />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.userName || 'Member'}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.userRole} numberOfLines={1}>
              {post.role || 'User'}
            </Text>
            <Text style={styles.metaDot}>{'\u2022'}</Text>
            <Text style={styles.timeText}>
              {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <Text style={styles.caption} numberOfLines={5}>
        {post.caption || post.content}
      </Text>

      <Image source={{ uri: post.imageUrl || post.image }} style={styles.postImage} contentFit="cover" />

      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <ActionButton icon="heart-outline" label={post.likesCount || 0} onPress={onLike} />
          <ActionButton icon="chatbubble-outline" label={post.commentsCount || 0} />
          <TouchableOpacity style={styles.iconOnlyButton} activeOpacity={0.72}>
            <Ionicons name="share-social-outline" size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.iconOnlyButton} activeOpacity={0.72}>
          <Ionicons name="bookmark-outline" size={22} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionButton} activeOpacity={0.72} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#374151" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

import { useDependencies } from '../../../app/DependencyProvider';
import { useAuthStore } from '../../../store/authStore';

export default function FeedScreen() {
  const { posts, setPosts, refreshing, refetch, loadMore } = useFeed();
  const { repositories: { postRepository } } = useDependencies();
  const user = useAuthStore((state) => state.user);

  const handleLike = async (postId, currentLikes) => {
    if (!user) return;
    try {
      // Optimistic update
      setPosts(posts.map(p => p.id === postId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p));
      await postRepository.likePost(postId, user.id);
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update
      setPosts(posts.map(p => p.id === postId ? { ...p, likesCount: currentLikes } : p));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <FeedHeader />

      <FlatList
        data={posts}
        keyExtractor={(item, index) => item.id ? `${item.id}_${index}` : index.toString()}
        renderItem={({ item }) => <PostCard post={item} onLike={() => handleLike(item.id, item.likesCount || 0)} />}
        ListHeaderComponent={<FeaturedCreators />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={11}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({ length: 450, offset: 450 * index, index })}
        onRefresh={refetch}
        refreshing={refreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    zIndex: 5,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 34,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 126,
    height: 38,
    marginLeft: 10,
  },
  feedContent: {
    paddingBottom: 104,
  },
  featuredSection: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingTop: 18,
    paddingBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  viewAllText: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '700',
  },
  creatorList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  creatorItem: {
    width: 64,
    alignItems: 'center',
  },
  creatorAvatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EDE9FE',
  },
  creatorName: {
    color: '#1F2937',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 7,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EDE9FE',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  userName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userRole: {
    color: '#374151',
    fontSize: 10,
    fontWeight: '600',
    maxWidth: 126,
  },
  metaDot: {
    color: '#6B7280',
    fontSize: 10,
    marginHorizontal: 4,
  },
  timestamp: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600',
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
    marginBottom: 14,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1.35,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
  },
  actionBar: {
    height: 36,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  iconOnlyButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  offlineBanner: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});