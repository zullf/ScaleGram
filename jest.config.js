module.exports = {
  preset: 'jest-expo',
  // 🔥 1. Beritahu Jest untuk membaca file setup mock yang kita buat
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  // 🔥 2. Tambahkan |firebase|@firebase di paling akhir daftar agar tidak di-ignore oleh Jest
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase)'
  ]
};