import {Meeting} from '../types';

/**
 * Simple string hashing function for generating meeting IDs
 * Based on the djb2 algorithm
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Generates a unique hash ID for a meeting based on its name, time, and location
 * @param meeting The meeting object to generate a hash for
 * @returns A string hash that uniquely identifies the meeting
 */
export function generateMeetingHash(meeting: Meeting): string {
  // Create a string representation of the meeting's unique properties
  const meetingString = [
    meeting.name,
    meeting.time,
    meeting.street,
    meeting.city || '',
    meeting.state || '',
    meeting.zip || '',
    meeting.locationName || '',
    meeting.online ? 'online' : 'in-person',
    meeting.link || '',
    meeting.lat || '',
    meeting.lng || '',
  ].join('|');

  // Generate a hash using our simple hashing function
  const hash = hashString(meetingString);

  // Convert to a positive hex string and ensure it's at least 8 characters
  return Math.abs(hash).toString(16).padStart(8, '0');
}
