export const mapFirebaseUserToEntity = (firebaseUser) => {
  if (!firebaseUser) return null;
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || '',
    photoUrl: firebaseUser.photoURL || '',
  };
};