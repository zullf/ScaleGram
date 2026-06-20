import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PasswordField({
  value,
  onChangeText,
  showPassword,
  onTogglePassword,
  style,
}) {
  return (
    <View style={style}>
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordField}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#B8B4C7"
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onTogglePassword}
          activeOpacity={0.7}
        >
          <View style={styles.eyeIcon}>
            <View style={[styles.eyePupil, showPassword && styles.eyePupilActive]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#282433',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 2,
  },
  passwordField: {
    height: 44,
    borderColor: '#C7C0E1',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FAF8FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#1D1B26',
  },
  eyeButton: {
    minWidth: 46,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  eyeIcon: {
    width: 18,
    height: 12,
    borderColor: '#5D596C',
    borderWidth: 1.4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5D596C',
  },
  eyePupilActive: {
    backgroundColor: '#4D49DF',
  },
});
