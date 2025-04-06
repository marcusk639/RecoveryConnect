import {Meeting} from '../types/meeting';
import {generateMeetingHash} from './hashUtils';

// Add Jest type definitions
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;

describe('generateMeetingHash', () => {
  it('should generate consistent hashes for the same meeting data', () => {
    const meeting1: Meeting = {
      id: '',
      name: 'Monday Night AA',
      time: '19:00',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      locationName: 'Community Center',
      online: false,
    };

    const meeting2: Meeting = {
      id: '',
      name: 'Monday Night AA',
      time: '19:00',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      locationName: 'Community Center',
      online: false,
    };

    const hash1 = generateMeetingHash(meeting1);
    const hash2 = generateMeetingHash(meeting2);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{8,}$/); // Should be a hex string of at least 8 characters
  });

  it('should generate different hashes for different meeting data', () => {
    const meeting1: Meeting = {
      id: '',
      name: 'Monday Night AA',
      time: '19:00',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      locationName: 'Community Center',
      online: false,
    };

    const meeting2: Meeting = {
      id: '',
      name: 'Monday Night AA',
      time: '20:00', // Different time
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      locationName: 'Community Center',
      online: false,
    };

    const hash1 = generateMeetingHash(meeting1);
    const hash2 = generateMeetingHash(meeting2);

    expect(hash1).not.toBe(hash2);
  });
});
