// src/domain/entities/User.js

export default class User {
  /**
   * @param {Object} params
   * @param {string} params.id - UID dari Firebase Auth
   * @param {string} params.email - Email pengguna
   * @param {string} params.displayName - Nama lengkap/username
   * @param {string|null} [params.photoURL=null] - URL foto profil
   * @param {string} [params.bio=''] - Bio singkat profil
   * @param {Date|number} [params.createdAt] - Waktu pembuatan akun
   */
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