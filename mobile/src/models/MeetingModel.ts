import {Meeting, Location, MeetingSearchInput} from '../types';
import {FirestoreDocument, MeetingDocument} from '../types/schema';
import {firestore, auth, functions} from '../services/firebase/config';
import {generateMeetingHash} from '../utils/hashUtils';

/**
 * Meeting model for managing meeting data
 */
export class MeetingModel {
  /**
   * Convert a Firestore meeting document to a Meeting object
   */
  static fromFirestore(doc: FirestoreDocument<MeetingDocument>): Meeting {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      type: data.type as any, // Cast to MeetingType
      day: data.day,
      time: data.time,
      street: data.street || '',
      address: data.address || '',
      groupId: data.groupId,
      city: data.city,
      state: data.state,
      zip: data.zip,
      lat: data.lat,
      lng: data.lng,
      locationName: data.location,
      online: data.isOnline,
      link: data.onlineLink,
      onlineNotes: data.onlineNotes,
      verified: data.verified,
      addedBy: data.addedBy,
    };
  }

  /**
   * Convert a Meeting object to a Firestore document
   */
  static toFirestore(meeting: Partial<Meeting>): Partial<MeetingDocument> {
    const firestoreData: Partial<MeetingDocument> = {};

    if (meeting.name !== undefined) firestoreData.name = meeting.name;
    if (meeting.type !== undefined) firestoreData.type = meeting.type;
    if (meeting.day !== undefined) firestoreData.day = meeting.day;
    if (meeting.time !== undefined) firestoreData.time = meeting.time;
    if (meeting.street !== undefined) firestoreData.street = meeting.street;
    if (meeting.address !== undefined) firestoreData.address = meeting.address;
    if (meeting.city !== undefined) firestoreData.city = meeting.city;
    if (meeting.state !== undefined) firestoreData.state = meeting.state;
    if (meeting.zip !== undefined) firestoreData.zip = meeting.zip;
    if (meeting.lat !== undefined) firestoreData.lat = meeting.lat;
    if (meeting.lng !== undefined) firestoreData.lng = meeting.lng;
    if (meeting.locationName !== undefined)
      firestoreData.location = meeting.locationName;
    if (meeting.online !== undefined) firestoreData.isOnline = meeting.online;
    if (meeting.link !== undefined) firestoreData.onlineLink = meeting.link;
    if (meeting.onlineNotes !== undefined)
      firestoreData.onlineNotes = meeting.onlineNotes;
    if (meeting.verified !== undefined)
      firestoreData.verified = meeting.verified;
    if (meeting.addedBy !== undefined) firestoreData.addedBy = meeting.addedBy;
    if (meeting.groupId !== undefined) firestoreData.groupId = meeting.groupId;

    return firestoreData;
  }

  /**
   * Get a meeting by ID
   */
  static async getById(meetingId: string): Promise<Meeting | null> {
    try {
      const doc = await firestore.collection('meetings').doc(meetingId).get();

      if (!doc.exists) {
        return null;
      }

      return MeetingModel.fromFirestore({
        id: doc.id,
        data: () => doc.data() as MeetingDocument,
      });
    } catch (error) {
      console.error('Error getting meeting:', error);
      throw error;
    }
  }

  /**
   * Create a batch of meetings
   */
  static async createBatch(
    meetingData: Partial<Meeting>[],
  ): Promise<Meeting[]> {
    const batch = firestore.batch();
    const meetings: Meeting[] = [];

    for (const meeting of meetingData) {
      const id = generateMeetingHash(meeting as Meeting);
      batch.set(
        firestore.collection('meetings').doc(id),
        MeetingModel.toFirestore(meeting),
      );
      meetings.push({
        ...meeting,
        id,
      } as Meeting);
    }

    await batch.commit();

    return meetings;
  }

  /**
   * Create a new meeting
   */
  static async create(meetingData: Partial<Meeting>): Promise<Meeting> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const now = new Date();

      const newMeeting = {
        ...meetingData,
        id: generateMeetingHash(meetingData as Meeting),
        verified: false, // New meetings start unverified
        addedBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await firestore
        .collection('meetings')
        .add(MeetingModel.toFirestore(newMeeting));

      const createdMeeting = await docRef.get();
      return {
        ...MeetingModel.fromFirestore({
          id: createdMeeting.id,
          data: () => createdMeeting.data() as MeetingDocument,
        }),
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  /**
   * Update a meeting
   */
  static async update(
    meetingId: string,
    meetingData: Partial<Meeting>,
  ): Promise<Meeting> {
    try {
      const meetingRef = firestore.collection('meetings').doc(meetingId);
      const meetingDoc = await meetingRef.get();

      if (!meetingDoc.exists) {
        throw new Error('Meeting not found');
      }

      const updatedFields = {
        ...meetingData,
        updatedAt: new Date(),
      };

      await meetingRef.update(MeetingModel.toFirestore(updatedFields));

      const updatedDoc = await meetingRef.get();
      return MeetingModel.fromFirestore({
        id: updatedDoc.id,
        data: () => updatedDoc.data() as MeetingDocument,
      });
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  /**
   * Search for meetings using the cloud function
   */
  static async findMeetings(
    searchInput: MeetingSearchInput,
  ): Promise<Meeting[]> {
    try {
      const result = await functions.httpsCallable('findMeetings')(searchInput);

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid response from findMeetings function');
      }

      // Convert to Meeting objects
      const meetings = result.data.map((meeting: any) => ({
        id: meeting.id,
        name: meeting.name,
        type: meeting.type,
        day: meeting.day,
        time: meeting.time,
        street: meeting.address || '',
        city: meeting.city,
        state: meeting.state,
        zip: meeting.zip,
        lat: meeting.lat,
        lng: meeting.lng,
        locationName: meeting.location,
        types: meeting.types,
        online: meeting.isOnline,
        link: meeting.onlineLink,
        onlineNotes: meeting.onlineNotes,
        verified: meeting.verified,
        addedBy: meeting.addedBy,

        // Add extra fields for UI
        isFavorite: false, // Will be updated later
      }));

      // Check if meetings are in user's favorites
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await firestore
          .collection('users')
          .doc(currentUser.uid)
          .get();
        const userData = userDoc.data();
        const favorites = userData?.favoriteMeetings || [];

        // Mark favorite meetings
        meetings.forEach(meeting => {
          if (meeting.id && favorites.includes(meeting.id)) {
            meeting.isFavorite = true;
          }
        });
      }

      return meetings;
    } catch (error) {
      console.error('Error finding meetings:', error);
      throw error;
    }
  }

  /**
   * Check if a meeting is a favorite
   */
  static async isFavorite(meetingId: string): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return false;
      }

      const userDoc = await firestore
        .collection('users')
        .doc(currentUser.uid)
        .get();
      const userData = userDoc.data();
      const favorites = userData?.favoriteMeetings || [];

      return favorites.includes(meetingId);
    } catch (error) {
      console.error('Error checking if meeting is favorite:', error);
      return false;
    }
  }

  static async getMeetingsByGroupId(groupId: string): Promise<Meeting[]> {
    const meetings = await firestore
      .collection('meetings')
      .where('groupId', '==', groupId)
      .get();

    return meetings.docs.map(doc =>
      MeetingModel.fromFirestore({
        id: doc.id,
        data: () => doc.data() as MeetingDocument,
      }),
    );
  }
}
