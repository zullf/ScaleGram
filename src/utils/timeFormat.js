export const timeAgo = (dateInput) => {
  if (!dateInput) return "Baru Saja";

  const time = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  const now = new Date();
  
  const seconds = Math.round((now - time) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (seconds < 60) {
    return 'Baru Saja';
  } else if (minutes < 60) {
    return `${minutes} menit yang lalu`;
  } else if (hours < 24) {
    return `${hours} jam yang lalu`;
  } else if (days < 7) {
    return `${days} hari yang lalu`;
  } else if (weeks < 4) {
    return `${weeks} minggu yang lalu`;
  } else if (months < 12) {
    return `${months} bulan yang lalu`;
  } else {
    return `${years} tahun yang lalu`;
  }
};