import { Location } from "../entities/GeocodeResponse";
import {
  getNAMeetings,
  getAAMeetings,
  partialGeocode,
  getCelebrateRecoveryMeetings,
} from "../api/api";
import { getDistance } from "./location";
import tabletojson from "tabletojson";
import { NAMeetingResponse, NAMeeting } from "../entities/NAMeetingResponse";
import {
  MeetingSearchCriteria,
  MeetingType,
  Meeting,
} from "../entities/Meeting";
import { AAMeeting } from "../entities/AAMeetingResponse";
import { daysOfWeek } from "./date";
import { getMeetings, ratsFirestore } from "../api/firestore";
import geohash from "ngeohash";
import { logger } from "firebase-functions/v1";
import { parseString } from "xml2js";
import {
  CelebrateRecoveryMeeting,
  CelebrateRecoveryMeetings,
} from "../entities/CelebrateRecoveryMeeting";
import moment from "moment";

// expects time in military format (800, 1600, 2300, etc)
const getMeetingTime = (time: number) => {
  const hours = time / 100;
  const minutes = time % 100;
  return (
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (minutes < 10 ? "0" + minutes : minutes)
  );
};

export const getMeetingEntity = (meeting: any, type: MeetingType) => {
  try {
    const meetingEntity = new Meeting();
    if (type === "AA") {
      const aaMeeting = meeting as AAMeeting;
      meetingEntity.name = aaMeeting.name;
      meetingEntity.street = aaMeeting.address;
      meetingEntity.city = aaMeeting.city;
      meetingEntity.time = aaMeeting.time.substring(
        0,
        aaMeeting.time.lastIndexOf(":")
      );
      meetingEntity.zip = aaMeeting.postal_code;
      meetingEntity.state = aaMeeting.state;
      meetingEntity.locationName = aaMeeting.location_name;
      meetingEntity.types = aaMeeting.types.split(",");
      meetingEntity.lat = parseFloat(aaMeeting.latitude);
      meetingEntity.lng = parseFloat(aaMeeting.longitude);
      meetingEntity.type = "AA";
      meetingEntity.day = daysOfWeek[aaMeeting.day];
      meetingEntity.online = !!aaMeeting.conference_url;
      meetingEntity.link = aaMeeting.conference_url;
      meetingEntity.onlineNotes = aaMeeting.conference_url_notes;
    }
    if (type === "NA") {
      const naMeeting = meeting as NAMeeting;
      meetingEntity.type = "NA";
      meetingEntity.name = naMeeting.com_name;
      meetingEntity.day = daysOfWeek[naMeeting.mtg_day - 1];
      meetingEntity.Location = [
        naMeeting.com_name,
        naMeeting.address,
        `${naMeeting.city}, ${naMeeting.state} ${naMeeting.zip}`,
        naMeeting.directions,
      ];
      meetingEntity.time = getMeetingTime(naMeeting.mtg_time);
      meetingEntity.lat = naMeeting.latitude;
      meetingEntity.lng = naMeeting.longitude;
      meetingEntity.online = naMeeting.online === "Yes";
      meetingEntity.onlineNotes = naMeeting.password;
      meetingEntity.link = naMeeting.link;
    }
    if (type === "Celebrate Recovery") {
      const crMeeting = meeting as CelebrateRecoveryMeeting;
      meetingEntity.type = "Celebrate Recovery";
      const addressParts = crMeeting.address[0].split(",");
      meetingEntity.name = crMeeting.name[0];
      meetingEntity.street = addressParts[0];
      meetingEntity.city = addressParts[1].trim();
      const stateZipCountry = addressParts[2].split(" ").slice(1); // ignore the first element since it is an empty string
      meetingEntity.state = stateZipCountry[0];
      meetingEntity.zip = stateZipCountry[1];
      const [day, time] = crMeeting.custom2[0]._.split(" ");
      if (day && time) {
        meetingEntity.day = day.toLowerCase().trim();
        meetingEntity.time = moment(time, ["h:mm A"]).format("HH:mm"); // 12 hour time to 24 hour time (e.g., 5:00 PM to 17:00)
      }
      meetingEntity.lat = parseFloat(crMeeting.lat[0]);
      meetingEntity.lng = parseFloat(crMeeting.lng[0]);
    }
    return meetingEntity;
  } catch (err) {
    logger.error("failed to map meeting", meeting, err);
    return null;
  }
};

const criteriaExists = (criteria: string) => {
  return criteria && criteria.length;
};

const getMeetingsWithinDistance = (
  location: Location,
  meetings: Meeting[],
  type?: MeetingType,
  distance = 16000
) => {
  const meetingsWithinDistance = [];
  meetings.forEach((meeting) => {
    let meetingEntity = meeting;
    if (type) {
      meetingEntity = getMeetingEntity(meeting, type);
      if (!meetingEntity) return;
    }
    // 10 miles in meters
    if (
      getDistance(
        { lat: meetingEntity.lat || 0, lng: meetingEntity.lng || 0 },
        location
      ) <= distance
    ) {
      meetingsWithinDistance.push(meetingEntity);
    }
  });
  return meetingsWithinDistance;
};

export const filterCustomMeetings = (
  meetings: Meeting[],
  criteria: MeetingSearchCriteria
) => {
  logger.info("Filtering custom meetings by critera", criteria);
  return meetings.filter((meeting) => {
    let meetingMeetsCriteria = true;
    if (criteriaExists(criteria.name)) {
      meetingMeetsCriteria =
        meeting.name.toLowerCase().includes(criteria.name.toLowerCase()) &&
        meetingMeetsCriteria;
    }
    if (criteriaExists(criteria.city)) {
      meetingMeetsCriteria =
        meeting.city.toLowerCase().includes(criteria.city.toLowerCase()) &&
        meetingMeetsCriteria;
    }
    if (criteriaExists(criteria.street)) {
      meetingMeetsCriteria =
        meeting.street.toLowerCase().includes(criteria.street.toLowerCase()) &&
        meetingMeetsCriteria;
    }
    if (criteriaExists(criteria.state)) {
      meetingMeetsCriteria =
        meeting.state.toLowerCase().includes(criteria.state.toLowerCase()) &&
        meetingMeetsCriteria;
    }
    if (criteria.location) {
      meetingMeetsCriteria =
        getDistance(
          { lat: meeting.lat || 0, lng: meeting.lng || 0 },
          criteria.location
        ) <= 500 && meetingMeetsCriteria;
    }
    return meetingMeetsCriteria;
  });
};

export const getCustomMeetings = async (
  location: Location,
  criteria?: MeetingSearchCriteria
) => {
  logger.info("Retrieving custom meetings");
  try {
    const start = Date.now();
    const meetingQuery = await getMeetings();
    let meetings = meetingQuery.docs.map((doc) => doc.data() as Meeting);
    meetings = getMeetingsWithinDistance(location, meetings);
    if (criteria) {
      return filterCustomMeetings(meetings, criteria);
    }
    logger.info("Custom meetings in", (Date.now() - start) / 1000, "seconds");
    return meetings;
  } catch (error) {
    logger.info("Error retrieving custom meetings", error);
  }
  return [];
};

export const filterMeetingsByCriteria = (
  meetings: Meeting[],
  criteria: MeetingSearchCriteria,
  type: MeetingType
) => {
  let filteredMeetings = meetings.slice();
  if (criteria && (type === "AA" || type === "Celebrate Recovery")) {
    logger.info("Filtering by criteria", criteria);
    if (criteria.name) {
      filteredMeetings = meetings.filter((meeting) =>
        meeting.name.toLowerCase().includes(criteria.name.toLowerCase())
      );
    }
  }
  if (criteria && type === "NA") {
    logger.info("Filtering by criteria", criteria);
    if (criteria.name) {
      filteredMeetings = meetings.filter((meeting) =>
        meeting.name.toLowerCase().includes(criteria.name.toLowerCase())
      );
    }
    // do some stuff
  }
  return filteredMeetings;
};

export const getNarcoticsAnoymousMeetings = async (
  location: Location,
  criteria?: MeetingSearchCriteria,
  day?: string
) => {
  try {
    const start = Date.now();
    const naMeetingList = await getNAMeetings(location, 10, day); // 15 miles
    logger.info("NA meeting list", naMeetingList);
    logger.info("NA meetings in", (Date.now() - start) / 1000, "seconds");
    return filterMeetingsByCriteria(naMeetingList, criteria, "NA");
  } catch (error) {
    logger.info("Failed to get NA meetings", error);
    return [];
  }
};

export const getCelebrateMeetings = async (
  location: Location,
  criteria?: MeetingSearchCriteria
) => {
  logger.info("Retrieving celebrate recovery meetings...");
  const result = await getCelebrateRecoveryMeetings(location.lat, location.lng);
  const parsed = await parseXml(result);
  const meetings = parsed.markers.marker
    .map((meeting) => getMeetingEntity(meeting, "Celebrate Recovery"))
    .filter((meeting) => meeting);
  logger.info("Retrieved celebrate recovery meetings");
  return filterMeetingsByCriteria(meetings, criteria, "Celebrate Recovery");
};

const parseXml = (xml: string): Promise<CelebrateRecoveryMeetings> => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result: CelebrateRecoveryMeetings) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Returns meetings by location and optionally by other criteria
 * @param location
 * @param meetingName
 */
export const getAlcoholicsAnonymousMeetings = async (
  location: Location,
  criteria?: MeetingSearchCriteria
) => {
  const start = Date.now();
  const meetingsResponse = await getAAMeetings(location.lat, location.lng);
  const meetings = meetingsResponse.meetings
    .map((meeting) => getMeetingEntity(meeting, "AA"))
    .filter((meeting) => meeting);
  logger.info("AA meetings in", (Date.now() - start) / 1000, "seconds");
  return filterMeetingsByCriteria(meetings, criteria, "AA");
};

export const getAll12StepMeetings = async (
  location: Location,
  criteria?: MeetingSearchCriteria,
  day?: string
) => {
  logger.info("Retrieving all 12 step meetings...");
  const start = Date.now();
  const meetingPromises = [
    getAlcoholicsAnonymousMeetings(location, criteria),
    getNarcoticsAnoymousMeetings(location, criteria, day),
    getCelebrateMeetings(location, criteria),
    getCustomMeetings(location, criteria),
  ];
  const meetings = await Promise.all(meetingPromises);
  logger.info(
    "Retrieved all 12 step meetings in ",
    (Date.now() - start) / 1000
  );
  return [...meetings[0], ...meetings[1], ...meetings[2]];
};

/**
 * Gets the latitude and longitude from the NA meeting Location property
 * @param query
 */
export const geocodeNAMeeting = async (query: string) => {
  logger.info("Retrieving geocode for NA meeting", query);
  const geocodeResponse = await partialGeocode(query);
  let location: Location;
  geocodeResponse.results.some((result) => {
    if (result.geometry && result.geometry.location) {
      location = result.geometry.location;
      logger.info("NA meeting successfully geocoded");
      return true;
    }
    return false;
  });
  return location;
};

// / geohashUtils.js

// Default geohash length
const g_GEOHASH_PRECISION = 10;

// Characters used in location geohashes
const g_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

// The meridional circumference of the earth in meters
const g_EARTH_MERI_CIRCUMFERENCE = 40007860;

// Length of a degree latitude at the equator
const g_METERS_PER_DEGREE_LATITUDE = 110574;

// Number of bits per geohash character
const g_BITS_PER_CHAR = 5;

// Maximum length of a geohash in bits
const g_MAXIMUM_BITS_PRECISION = 22 * g_BITS_PER_CHAR;

// Equatorial radius of the earth in meters
const g_EARTH_EQ_RADIUS = 6378137.0;

// The following value assumes a polar radius of
// var g_EARTH_POL_RADIUS = 6356752.3;
// The formulate to calculate g_E2 is
// g_E2 == (g_EARTH_EQ_RADIUS^2-g_EARTH_POL_RADIUS^2)/(g_EARTH_EQ_RADIUS^2)
// The exact value is used here to avoid rounding errors
const g_E2 = 0.00669447819799;

// Cutoff for rounding errors on double calculations
const g_EPSILON = 1e-12;

Math.log2 =
  Math.log2 ||
  function (x) {
    return Math.log(x) / Math.log(2);
  };

/**
 * Converts degrees to radians.
 *
 * @param {number} degrees The number of degrees to be converted to radians.
 * @return {number} The number of radians equal to the inputted number of degrees.
 */
const degreesToRadians = function (degrees) {
  if (typeof degrees !== "number" || isNaN(degrees)) {
    throw new Error("Error: degrees must be a number");
  }

  return (degrees * Math.PI) / 180;
};

/**
 * Calculates the number of degrees a given distance is at a given latitude.
 *
 * @param {number} distance The distance to convert.
 * @param {number} latitude The latitude at which to calculate.
 * @return {number} The number of degrees the distance corresponds to.
 */
const metersToLongitudeDegrees = function (distance, latitude) {
  const radians = degreesToRadians(latitude);
  const num = (Math.cos(radians) * g_EARTH_EQ_RADIUS * Math.PI) / 180;
  const denom = 1 / Math.sqrt(1 - g_E2 * Math.sin(radians) * Math.sin(radians));
  const deltaDeg = num * denom;
  if (deltaDeg < g_EPSILON) {
    return distance > 0 ? 360 : 0;
  } else {
    return Math.min(360, distance / deltaDeg);
  }
};

/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the longitude at a
 * given latitude.
 *
 * @param {number} resolution The desired resolution.
 * @param {number} latitude The latitude used in the conversion.
 * @return {number} The bits necessary to reach a given resolution, in meters.
 */
const longitudeBitsForResolution = function (resolution, latitude) {
  const degs = metersToLongitudeDegrees(resolution, latitude);
  return Math.abs(degs) > 0.000001 ? Math.max(1, Math.log2(360 / degs)) : 1;
};

/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the latitude.
 *
 * @param {number} resolution The bits necessary to reach a given resolution, in meters.
 */
const latitudeBitsForResolution = function (resolution) {
  return Math.min(
    Math.log2(g_EARTH_MERI_CIRCUMFERENCE / 2 / resolution),
    g_MAXIMUM_BITS_PRECISION
  );
};

/**
 * Wraps the longitude to [-180,180].
 *
 * @param {number} longitude The longitude to wrap.
 * @return {number} longitude The resulting longitude.
 */
const wrapLongitude = function (longitude) {
  if (longitude <= 180 && longitude >= -180) {
    return longitude;
  }
  const adjusted = longitude + 180;
  if (adjusted > 0) {
    return (adjusted % 360) - 180;
  } else {
    return 180 - (-adjusted % 360);
  }
};

/**
 * Calculates the maximum number of bits of a geohash to get a bounding box that is larger than a
 * given size at the given coordinate.
 *
 * @param {Array.<number>} coordinate The coordinate as a [latitude, longitude] pair.
 * @param {number} size The size of the bounding box.
 * @return {number} The number of bits necessary for the geohash.
 */
const boundingBoxBits = function (coordinate, size) {
  const latDeltaDegrees = size / g_METERS_PER_DEGREE_LATITUDE;
  const latitudeNorth = Math.min(90, coordinate[0] + latDeltaDegrees);
  const latitudeSouth = Math.max(-90, coordinate[0] - latDeltaDegrees);
  const bitsLat = Math.floor(latitudeBitsForResolution(size)) * 2;
  const bitsLongNorth =
    Math.floor(longitudeBitsForResolution(size, latitudeNorth)) * 2 - 1;
  const bitsLongSouth =
    Math.floor(longitudeBitsForResolution(size, latitudeSouth)) * 2 - 1;
  return Math.min(
    bitsLat,
    bitsLongNorth,
    bitsLongSouth,
    g_MAXIMUM_BITS_PRECISION
  );
};

/**
 * Calculates eight points on the bounding box and the center of a given circle. At least one
 * geohash of these nine coordinates, truncated to a precision of at most radius, are guaranteed
 * to be prefixes of any geohash that lies within the circle.
 *
 * @param {Array.<number>} center The center given as [latitude, longitude].
 * @param {number} radius The radius of the circle.
 * @return {Array.<Array.<number>>} The eight bounding box points.
 */
const boundingBoxCoordinates = function (center, radius) {
  const latDegrees = radius / g_METERS_PER_DEGREE_LATITUDE;
  const latitudeNorth = Math.min(90, center[0] + latDegrees);
  const latitudeSouth = Math.max(-90, center[0] - latDegrees);
  const longDegsNorth = metersToLongitudeDegrees(radius, latitudeNorth);
  const longDegsSouth = metersToLongitudeDegrees(radius, latitudeSouth);
  const longDegs = Math.max(longDegsNorth, longDegsSouth);
  return [
    [center[0], center[1]],
    [center[0], wrapLongitude(center[1] - longDegs)],
    [center[0], wrapLongitude(center[1] + longDegs)],
    [latitudeNorth, center[1]],
    [latitudeNorth, wrapLongitude(center[1] - longDegs)],
    [latitudeNorth, wrapLongitude(center[1] + longDegs)],
    [latitudeSouth, center[1]],
    [latitudeSouth, wrapLongitude(center[1] - longDegs)],
    [latitudeSouth, wrapLongitude(center[1] + longDegs)],
  ];
};

/**
 * Calculates the bounding box query for a geohash with x bits precision.
 *
 * @param {string} geohash The geohash whose bounding box query to generate.
 * @param {number} bits The number of bits of precision.
 * @return {Array.<string>} A [start, end] pair of geohashes.
 */
const geohashQuery = function (geohash, bits) {
  const precision = Math.ceil(bits / g_BITS_PER_CHAR);
  if (geohash.length < precision) {
    console.warn(
      "geohash.length < precision: " +
        geohash.length +
        " < " +
        precision +
        " bits=" +
        bits +
        " g_BITS_PER_CHAR=" +
        g_BITS_PER_CHAR
    );
    return [geohash, geohash + "~"];
  }
  geohash = geohash.substring(0, precision);
  const base = geohash.substring(0, geohash.length - 1);
  const lastValue = g_BASE32.indexOf(geohash.charAt(geohash.length - 1));
  const significantBits = bits - base.length * g_BITS_PER_CHAR;
  const unusedBits = g_BITS_PER_CHAR - significantBits;
  /* jshint bitwise: false*/
  // delete unused bits
  const startValue = (lastValue >> unusedBits) << unusedBits;
  const endValue = startValue + (1 << unusedBits);
  /* jshint bitwise: true*/
  if (endValue >= g_BASE32.length) {
    console.warn(
      "endValue > 31: endValue=" +
        endValue +
        " < " +
        precision +
        " bits=" +
        bits +
        " g_BITS_PER_CHAR=" +
        g_BITS_PER_CHAR
    );
    return [base + g_BASE32[startValue], base + "~"];
  } else {
    return [base + g_BASE32[startValue], base + g_BASE32[endValue]];
  }
};

/**
 * Calculates a set of queries to fully contain a given circle. A query is a [start, end] pair
 * where any geohash is guaranteed to be lexiographically larger then start and smaller than end.
 *
 * @param {Array.<number>} center The center given as [latitude, longitude] pair.
 * @param {number} radius The radius of the circle.
 * @return {Array.<Array.<string>>} An array of geohashes containing a [start, end] pair.
 */
const geohashQueries = function (center, radius) {
  const queryBits = Math.max(1, boundingBoxBits(center, radius));
  const geohashPrecision = Math.ceil(queryBits / g_BITS_PER_CHAR);
  const coordinates = boundingBoxCoordinates(center, radius);
  const queries = coordinates.map(function (coordinate) {
    return geohashQuery(
      geohash.encode(coordinate[0], coordinate[1]),
      queryBits
    );
  });
  // remove duplicates
  return queries.filter(function (query, index) {
    return !queries.some(function (other, otherIndex) {
      return (
        index > otherIndex && query[0] === other[0] && query[1] === other[1]
      );
    });
  });
};

export function getQueriesForDocumentsAround(ref, center, radiusInKm, day) {
  const geohashesToQuery = geohashQueries(
    [center.lat, center.lon],
    radiusInKm * 1000
  );
  logger.info("geohashes", JSON.stringify(geohashesToQuery));
  return geohashesToQuery.map(function (location) {
    return ref
      .where("geohash", ">=", location[0])
      .where("geohash", "<=", location[1]);
  });
}
