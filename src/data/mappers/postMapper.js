export const mapFirestoreDocToPostEntity = (doc) => {
  if (!doc) return null;
  
  return {
    id: doc.id,
    ...doc.data()
  };
};