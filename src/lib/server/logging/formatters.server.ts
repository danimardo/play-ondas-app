const madridFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Madrid',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function getLocalTime(): string {
  const parts = madridFormatter.formatToParts(new Date());
  const day = parts.find(p => p.type === 'day')?.value || '00';
  const month = parts.find(p => p.type === 'month')?.value || '00';
  const year = parts.find(p => p.type === 'year')?.value || '0000';
  const hour = parts.find(p => p.type === 'hour')?.value || '00';
  const minute = parts.find(p => p.type === 'minute')?.value || '00';
  const second = parts.find(p => p.type === 'second')?.value || '00';
  
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

export const formatters = {
  log(object: Record<string, unknown>) {
    return {
      ...object,
      localTime: getLocalTime(),
      timezone: 'Europe/Madrid',
    };
  },
};
