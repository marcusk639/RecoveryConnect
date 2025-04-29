// import {initializeApp} from '@react-native-firebase/app';
import FirebaseAuth from '@react-native-firebase/auth';
import FirebaseFunctions from '@react-native-firebase/functions';
const functions = FirebaseFunctions();
// import FirebaseDynamicLinks from '@react-native-firebase/dynamic-links';
import FirebaseFirestore from '@react-native-firebase/firestore';
// import FirebaseStorage from '@react-native-firebase/storage';
// import { FirebaseDatabaseTypes } from '@react-native-firebase/database';
// import { FirebaseStorageTypes } from '@react-native-firebase/storage';
//
// const app = firebase.app();
// const db = FirebaseDatabase();
const auth = FirebaseAuth();
// const messaging = FirebaseMessaging();
// const storage = FirebaseStorage();
// const functions = FirebaseFunctions();

// export const callHttpsFunction = (name: string, payload: any) => {
//   return FirebaseFunctions().httpsCallable(name)(payload);
// };

// const links = FirebaseDynamicLinks();
// auth.signOut();
const firestore = FirebaseFirestore();
firestore.settings({ignoreUndefinedProperties: true});
// firebase.enablePersistence(true);
// const channelId = 'notification-channel';
// const channel = new firebase.notifications.Android.Channel(channelId, 'Notification Channel', firebase.notifications.Android.Importance.Max);
// // firebase.notifications().android.createChannel(channel);
// notifications.android.createChannel(channel);

export {
  // db,
  firestore,
  auth,
  functions,
  // messaging,
  // storage,
  // functions,
  // links,
  // FirebaseAuthTypes,
  // FirebaseDatabaseTypes,
  // FirebaseFirestoreTypes,
  // FirebasepStorageTypes,
};
