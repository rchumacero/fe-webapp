import { getTimeZones, TimeZone } from '@vvo/tzdb';

export interface FriendlyTimeZone {
  name: string;
  label: string;
  offset: string;
  abbreviation: string;
}

export const getFriendlyTimeZones = (): FriendlyTimeZone[] => {
  const tzs = getTimeZones();
  return tzs.map((tz: TimeZone) => ({
    name: tz.name,
    label: `(GMT${tz.currentTimeOffsetInMinutes >= 0 ? '+' : ''}${Math.floor(tz.currentTimeOffsetInMinutes / 60).toString().padStart(2, '0')}:${Math.abs(tz.currentTimeOffsetInMinutes % 60).toString().padStart(2, '0')}) ${tz.mainCities.join(', ')}`,
    offset: tz.currentTimeFormat,
    abbreviation: tz.abbreviation,
  }));
};
