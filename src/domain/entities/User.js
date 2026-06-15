
export default class User {
  constructor({ 
    id, 
    email, 
    displayName, 
    photoURL = null, 
    bio = '', 
    createdAt = Date.now() 
  }) {
    this.id = id;
    this.email = email;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.bio = bio;
    this.createdAt = createdAt;
  }
}