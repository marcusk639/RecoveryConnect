export interface Group {
  id: string;
  name: string;
  description: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  geohash?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  foundedDate?: Timestamp;
  memberCount: number;
  admins: string[];
  adminUids: string[];
  isClaimed: boolean;
  pendingAdminRequests: {
    uid: string;
    requestedAt: Timestamp;
    message?: string;
  }[];
  placeName?: string;
  type: "AA";
  treasurers: string[];
  treasury: {
    groupId?: string;
    balance: number;
    prudentReserve: number;
    transactions: [];
    summary: {
      balance: number;
      prudentReserve: number;
      monthlyIncome: number;
      monthlyExpenses: number;
      lastUpdated: Date;
    };
  };
}

function createGroupDataFromMeeting(meeting: Meeting): {
  groupData: Group | null;
  confidence: number;
} {
  // ... (existing logic) ...

  // Create a new treasury object for the group
  const treasuryData = {
    balance: 0,
    prudentReserve: 0,
    transactions: [] as [],
    summary: {
      balance: 0,
      prudentReserve: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      lastUpdated: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // ... (create groupData object) ...
  const groupData: Partial<Group> = {
    // ... other fields ...
    treasury: treasuryData,
  };
  // ... (rest of function) ...
}

async function seedGroups() {
  // ... (initialization) ...
  for await (const meetingDoc of meetingStream as AsyncIterable<admin.firestore.QueryDocumentSnapshot>) {
    // ... (get meetingData, cacheKey) ...
    if (groupCache.has(cacheKey)) {
      // ... Cache Hit Logic ...
    } else {
      // --- Cache Miss: Search In-Memory Groups ---
      let existingGroupFound = false;
      let existingGroupId: string | undefined;
      let matchConfidence = 0;
      let bestMatchGroup: Group | undefined = undefined;

      if (meetingData.lat !== undefined && meetingData.lng !== undefined) {
        // ... (in-memory search loop sets bestMatchGroup) ...
      }
      // --- End In-Memory Search ---

      if (existingGroupFound && existingGroupId && bestMatchGroup) {
        // ... (Found Existing Group Logic) ...
      } else {
        // --- Create New Group ---
        const { groupData: newGroupData, confidence: createConfidence } =
          createGroupDataFromMeeting(meetingData);

        if (newGroupData) {
          totalGroupsCreated++;
          const newGroupRef = groupsRef.doc();
          newGroupData.id = newGroupRef.id;

          if (newGroupData.treasury) {
            newGroupData.treasury.groupId = newGroupRef.id;
          }

          if (newGroupData.lat && newGroupData.lng) {
            try {
              newGroupData.geohash = geofire.geohashForLocation(
                [newGroupData.lat, newGroupData.lng],
                GEOHASH_PRECISION
              );
            } catch (e) {
              console.error(
                `Error generating geohash for new group ${newGroupRef.id}:`,
                e
              );
            }
          }

          // ... (rest of create logic: console.log, batch.set, batch.update, cache, add to array) ...
        } else {
          // ... (skip logic) ...
        }
        // --- End Create New Group ---
      }
    }
    // ... (batch commit logic) ...
  }
  // ... (end of loop and function) ...
}
