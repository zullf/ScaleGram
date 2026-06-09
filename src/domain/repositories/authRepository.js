// src/domain/repositories/AuthRepository.js

export default class AuthRepository {
  /**
   * Mendaftarkan pengguna baru dengan email dan password.
   * @param {string} email
   * @param {string} password
   * @param {string} displayName
   * @returns {Promise<import('../entities/User').default>}
   */
  async register(email, password, displayName) {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: register method must be implemented');
  }

  /**
   * Masuk menggunakan email dan password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<import('../entities/User').default>}
   */
  async login(email, password) {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: login method must be implemented');
  }

  /**
   * Masuk menggunakan akun Google.
   * @returns {Promise<import('../entities/User').default>}
   */
  async googleSignIn() {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: googleSignIn method must be implemented');
  }

  /**
   * Keluar dari sesi aplikasi.
   * @returns {Promise<void>}
   */
  async logout() {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: logout method must be implemented');
  }

  /**
   * Mengirimkan email pemulihan kata sandi.
   * @param {string} email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: resetPassword method must be implemented');
  }
}