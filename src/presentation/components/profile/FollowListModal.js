import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import UserAvatar from '../common/UserAvatar';
import { normalizeProfileUser } from './profileFormatters';

export default function FollowListModal({
  visible,
  title,
  users = [],
  colors = {},
  onClose,
  onSelectUser,
}) {
  const normalizedUsers = users.map(normalizeProfileUser).filter((user) => user.id);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.card || '#FFFFFF' }]}>
          <View style={[styles.header, { borderBottomColor: colors.border || '#E5E7EB' }]}>
            <Text style={[styles.title, { color: colors.text || '#111827' }]}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} activeOpacity={0.72} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text || '#111827'} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={normalizedUsers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              normalizedUsers.length === 0 && styles.emptyContent,
            ]}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.userRow, { borderBottomColor: colors.border || '#EEF2FF' }]}
                activeOpacity={0.76}
                onPress={() => onSelectUser?.(item)}
              >
                <UserAvatar name={item.displayName} uri={item.photoURL} size={44} />
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.text || '#111827' }]} numberOfLines={1}>
                    {item.displayName}
                  </Text>
                  {item.bio || item.email ? (
                    <Text style={[styles.userMeta, { color: colors.mutedText || '#6B7280' }]} numberOfLines={1}>
                      {item.bio || item.email}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedText || '#9CA3AF'} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={30} color="#6366F1" />
                <Text style={[styles.emptyText, { color: colors.mutedText || '#6B7280' }]}>
                  Belum ada user untuk ditampilkan.
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '72%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  header: {
    minHeight: 58,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 18,
  },
  emptyContent: {
    minHeight: 180,
  },
  userRow: {
    minHeight: 68,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
  },
  userMeta: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
});
