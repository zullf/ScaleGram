
export default class AuthRepository {
  async register(email, password, displayName) {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: register method must be implemented');
  }


  async login(email, password) {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: login method must be implemented');
  }

  async googleSignIn() {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: googleSignIn method must be implemented');
  }


  async logout() {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: logout method must be implemented');
  }

  async resetPassword(email) {
    throw new Error('ERR_METHOD_NOT_IMPLEMENTED: resetPassword method must be implemented');
  }
}