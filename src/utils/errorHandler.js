export function getErrorMessage(error) {
  if (!error) {
    return 'Terjadi kesalahan.';
  }

  return error.message || String(error);
}
