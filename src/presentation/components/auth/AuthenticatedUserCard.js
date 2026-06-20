import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../common/AppButton';

export default function AuthenticatedUserCard({ user, loading, onLogout, onDeleteAccount }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.successText}>Berhasil Masuk!</Text>
        <Text style={styles.userData}>Nama: {user.displayName}</Text>
        <Text style={styles.userData}>Email: {user.email}</Text>
        <Text style={styles.userData}>UID: {user.id || user.uid}</Text>

        <View style={styles.actions}>
          <AppButton title="Logout" onPress={onLogout} />
          <AppButton
            title="Hapus Akun"
            variant="outline"
            color="#FF3B30"
            onPress={onDeleteAccount}
            disabled={loading}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  successText: {
    color: '#34C759',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  userData: {
    fontSize: 16,
    color: '#3A3A3C',
    marginBottom: 8,
  },
  actions: {
    marginTop: 20,
    width: '100%',
    gap: 12,
  },
  deleteButton: {
    height: 40,
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
