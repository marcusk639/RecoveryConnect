import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface GroupMemberDocument {
  groupId: string;
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  isAdmin: boolean;
  position?: string;
  sobrietyDate?: FirebaseFirestoreTypes.Timestamp;
  phoneNumber?: string;
  showSobrietyDate: boolean;
  showPhoneNumber: boolean;
  joinedAt: FirebaseFirestoreTypes.Timestamp;
}
