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

const posts = [
  {
    id: 'post-1',
    userName: 'Felix R.',
    role: 'UX Designer',
    avatar: creators[0].avatar,
    content:
      'Experimenting with new glassmorphism techniques in the latest Nexus dashboard iteration. The goal is to maximize whitespace while maintaining a sense of hierarchy through tonal layering.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=85',
    likes: '1.2k',
    comments: 48,
    timestamp: '2h ago',
  },
  {
    id: 'post-2',
    userName: 'Marcus K.',
    role: 'Creative Director',
    avatar: creators[2].avatar,
    content:
      'Motion is the soul of interaction. Working on atmospheric shader effects for our upcoming student showcases. What do you think of this depth?',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=85',
    likes: 842,
    comments: 124,
    timestamp: '5h ago',
  },
  {
    id: 'post-3',
    userName: 'Elena M.',
    role: 'Full-stack Dev',
    avatar: creators[3].avatar,
    content:
      'Finally launched the open-source library for the Sophist design system. Focus on accessibility and 8px grid perfection. Check it out in the link in bio.',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=85',
    likes: '3.4k',
    comments: 215,
    timestamp: '1d ago',
  },
  {
    id: 'post-4',
    userName: 'Sarah J.',
    role: 'Product Designer',
    avatar: creators[1].avatar,
    content:
      'Mapping the onboarding flow for a founder dashboard. Tiny copy changes reduced confusion in our prototype test by a surprising amount.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    likes: 931,
    comments: 67,
    timestamp: '1d ago',
  },
  {
    id: 'post-5',
    userName: 'Leo P.',
    role: 'Front-End Developer',
    avatar: creators[4].avatar,
    content:
      'Built a responsive card grid in React with fluid image ratios, reduced layout shift, and cleaner focus states for keyboard users.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=85',
    likes: '2.1k',
    comments: 139,
    timestamp: '2d ago',
  },
  {
    id: 'post-6',
    userName: 'Alya N.',
    role: 'Mobile Developer',
    avatar: creators[5].avatar,
    content:
      'React Native performance day. Memoized post cards, optimized image loading, and trimmed re-renders across the home feed.',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=85',
    likes: 778,
    comments: 52,
    timestamp: '2d ago',
  },
  {
    id: 'post-7',
    userName: 'Raka D.',
    role: 'Startup Founder',
    avatar: creators[6].avatar,
    content:
      'Our beta community crossed 1,000 makers today. The best product research still comes from listening carefully to early users.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=85',
    likes: '4.8k',
    comments: 318,
    timestamp: '3d ago',
  },
  {
    id: 'post-8',
    userName: 'Maya C.',
    role: 'Content Creator',
    avatar: creators[7].avatar,
    content:
      'Recording a breakdown about visual hierarchy for beginner designers. Strong layout decisions make content feel more trustworthy.',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85',
    likes: '1.7k',
    comments: 83,
    timestamp: '3d ago',
  },
  {
    id: 'post-9',
    userName: 'Nadia S.',
    role: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    content:
      'Refined a fintech mobile concept with calmer colors, clearer empty states, and a more confident primary action hierarchy.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85',
    likes: '2.9k',
    comments: 176,
    timestamp: '4d ago',
  },
  {
    id: 'post-10',
    userName: 'Dimas A.',
    role: 'Tech Writer',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=200&q=80',
    content:
      'Writing about the future of creative communities: smaller networks, higher signal, and tools that help people share process.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85',
    likes: 654,
    comments: 41,
    timestamp: '5d ago',
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

function CreatorItem({ creator }) {
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
}

function PostCard({ post }) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.avatar }} style={styles.userAvatar} contentFit="cover" />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.userName}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.userRole} numberOfLines={1}>
              {post.role}
            </Text>
            <Text style={styles.metaDot}>{'\u2022'}</Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <Text style={styles.caption} numberOfLines={5}>
        {post.content}
      </Text>

      <Image source={{ uri: post.image }} style={styles.postImage} contentFit="cover" />

      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <ActionButton icon="heart-outline" label={post.likes} />
          <ActionButton icon="chatbubble-outline" label={post.comments} />
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
}

function ActionButton({ icon, label }) {
  return (
    <TouchableOpacity style={styles.actionButton} activeOpacity={0.72}>
      <Ionicons name={icon} size={22} color="#374151" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <FeedHeader />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={<FeaturedCreators />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
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
});