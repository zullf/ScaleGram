export function normalizeProfileUser(user = {}) {
  return {
    id: user.id || user.userId,
    displayName: user.displayName || user.userName || 'ScaleGram User',
    photoURL: user.photoURL || user.userAvatar || null,
    email: user.email || null,
    bio: user.bio || null,
  };
}

export function createHandle(value) {
  return String(value || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18) || 'user';
}
