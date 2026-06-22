export function normalizeProfileUser(user = {}) {
  const displayName = [user.displayName, user.userName, user.username, user.email?.split('@')?.[0]]
    .find((name) => name && !['Pengguna', 'User', 'ScaleGram User'].includes(String(name).trim()));

  return {
    id: user.id || user.userId,
    displayName: displayName || 'ScaleGram User',
    photoURL: user.photoURL || user.photoUrl || user.profilePic || user.userAvatar || null,
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
