export function createAuthRepository(authDataSource, localStorage) {
  return {
    authDataSource,
    localStorage,
  };
}
