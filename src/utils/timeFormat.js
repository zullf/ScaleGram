function toValidDate(dateInput) {
  if (!dateInput) return null;

  if (typeof dateInput?.toDate === 'function') {
    const date = dateInput.toDate();
    return Number.isNaN(date?.getTime?.()) ? null : date;
  }

  if (dateInput instanceof Date) {
    return Number.isNaN(dateInput.getTime()) ? null : dateInput;
  }

  if (typeof dateInput === 'object') {
    if (typeof dateInput.seconds === 'number') {
      const millis =
        dateInput.seconds * 1000 +
        Math.floor((dateInput.nanoseconds || dateInput._nanoseconds || 0) / 1e6);
      const date = new Date(millis);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof dateInput._seconds === 'number') {
      const millis =
        dateInput._seconds * 1000 +
        Math.floor((dateInput._nanoseconds || 0) / 1e6);
      const date = new Date(millis);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(dateInput);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatFallbackDate(date) {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const timeAgo = (dateInput) => {
  const time = toValidDate(dateInput);
  if (!time) return 'Tanggal tidak diketahui';

  const diffMs = Date.now() - time.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'Baru saja';
  }

  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }

  if (hours < 24) {
    return `${hours} jam lalu`;
  }

  if (days < 7) {
    return `${days} hari lalu`;
  }

  if (weeks < 4) {
    return `${weeks} minggu lalu`;
  }

  if (months < 12) {
    return `${months} bulan lalu`;
  }

  if (Number.isFinite(years) && years >= 1) {
    return `${years} tahun lalu`;
  }

  return formatFallbackDate(time);
};
