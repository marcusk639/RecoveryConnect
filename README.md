## State Management with Redux Toolkit

This project uses Redux Toolkit for state management. The implementation follows an entity-based approach with the following slices:

- `authSlice`: Manages user authentication state
- `groupsSlice`: Manages group entities and relationships
- `transactionsSlice`: Manages financial transactions
- `treasurySlice`: Manages treasury statistics

### Using Redux in Components

To access Redux state in your components:

```typescript
import { useAppSelector, useAppDispatch } from "../store";
import { selectUserGroups } from "../store/slices/groupsSlice";

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectUserGroups);

  // Use groups data...
};
```

### Dispatching Actions

To dispatch Redux actions:

```typescript
import { fetchUserGroups } from "../store/slices/groupsSlice";

// In your component
const dispatch = useAppDispatch();

// Basic dispatch
dispatch(fetchUserGroups());

// Handling async results
dispatch(fetchUserGroups())
  .unwrap()
  .then((result) => {
    // Handle success
  })
  .catch((error) => {
    // Handle error
  });
```

### Caching Mechanism

The Redux implementation includes a caching mechanism to reduce unnecessary Firebase requests:

- Each slice maintains a `lastFetched` record for entities
- Data is only fetched if it's stale (based on configurable TTL values)
- Loading states are tracked to prevent duplicate requests

# RecoveryConnect

## Member Migration Process

The application has been updated to use a top-level `members` collection instead of group-specific subcollections. This change improves query performance and makes it easier to find users across multiple groups.

### Migration Steps

1. Run the migration script:

   ```bash
   cd scripts
   npm install
   # Run a dry-run first to see what would be migrated
   npm run migrate-dry-run
   # Run the actual migration
   npm run migrate
   ```

   If you need to use a service account:

   ```bash
   node migrateMembers.js --migrate --service-account=/path/to/serviceAccountKey.json
   ```

2. Verify the migration:

   - Check that members are correctly stored in the `members` collection
   - Confirm that group membership is working in the app
   - Test member-related functionality (adding/removing members, etc.)

3. After verifying that everything works correctly, you can clean up the old subcollections:

   ```bash
   cd scripts
   npm run cleanup
   ```

   ⚠️ **WARNING**: The cleanup process is irreversible and will permanently delete all member subcollections.

### Implementation Details

The migration changes include:

1. New `members` collection with documents using `${groupId}_${userId}` as IDs
2. Updated `MemberModel` class to handle all member operations
3. Modified `GroupModel` to use the new `MemberModel` methods
4. Migration script to move existing data to the new structure

See `scripts/README.md` for more details on the migration process.

The schema for the new members collection is:

```typescript
interface GroupMemberDocument {
  id: string; // User ID
  groupId: string; // Group ID
  displayName: string; // User's display name
  email?: string; // User's email
  photoURL?: string; // User's profile photo URL
  joinedAt: Timestamp; // When the user joined the group
  sobrietyDate?: Timestamp; // User's sobriety date
  position?: string; // Position in the group (secretary, treasurer, etc.)
  isAdmin: boolean; // Whether the user is an admin of the group
  showSobrietyDate: boolean; // Privacy setting for displaying sobriety date
}
```
