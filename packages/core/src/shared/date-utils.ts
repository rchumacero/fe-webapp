/**
 * Gets the current timezone from localStorage or defaults to browser/UTC
 */
const getCurrentTimezone = (): string => {
  if (typeof window === 'undefined') return 'UTC';
  return localStorage.getItem('app-timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

/**
 * Formats a YYYY-MM-DD date string to DD-MM-YYYY
 */
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  
  // Format as date only, ignoring time and timezone for birthdates usually
  const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
  const parts = dateOnly.split('-');
  
  if (parts.length !== 3) return dateStr;
  
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};

/**
 * Formats a YYYY-MM-DD HH:mm:ss date string to DD-MM-YYYY HH:mm based on selected timezone
 */
export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  
  try {
    // Ensure the date string is interpreted as UTC if it doesn't have an offset
    const isoString = dateStr.includes('Z') || dateStr.includes('+') || dateStr.includes('-') && dateStr.length > 10
      ? dateStr 
      : `${dateStr.replace(' ', 'T')}Z`;
      
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('es-PY', { // Using es-PY for dd-mm-yyyy style
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: getCurrentTimezone(),
      hour12: false
    }).format(date).replace(',', '');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};
