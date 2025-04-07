const hash = require('ngeohash');
const admin = require('firebase-admin');
const serviceAccount = require('./service-key.json')['cleanhouse'];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://phoenix-cleanhouse.firebaseio.com',
  // databaseURL: 'https://rats-dev.firebaseio.com'
});
const naMeetings = require('./na-meetings.json');

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const geohash = (lat, lng) => {
  return hash.encode(lat, lng);
}

// expects time in military format (800, 1600, 2300, etc)
const getMeetingTime = (time) => {
  const hours = time / 100;
  const minutes = time % 100;
  return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);
};

const transform = {
  com_name: 'name',
  latitude: 'lat',
  longitude: 'lng',
  mtg_day: 'day',
  mtg_time: 'time',
};

const meetings = [];

naMeetings.forEach((raw) => {
  const meeting = {};
  Object.keys(raw).forEach((key) => {
    if (transform[key]) {
      meeting[transform[key]] = raw[key];
    } else {
      meeting[key] = raw[key];
    }
  });
  meeting.day = daysOfWeek[raw.mtg_day - 1];
  meeting.time = getMeetingTime(raw.mtg_time);
  meeting.Location = [raw.com_name, raw.address, `${raw.city}, ${raw.state} ${raw.zip}`, raw.directions];
  meeting.type = 'NA';
  meeting.geohash = geohash(raw.latitude, raw.longitude);
  meetings.push(meeting);
});

(async () => {
  let count = 0;

  for (const meeting of meetings) {
    admin
    .firestore()
    .collection('na-meetings')
    .add(meeting);

    count++;
  }

  console.log('uploaded', count, 'meetings');
})();

