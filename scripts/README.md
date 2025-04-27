# RecoveryConnect Migration Scripts

This directory contains utility scripts for database migrations in the RecoveryConnect application.

## Member Migration Script

The `migrateMembers.js` script migrates group members from subcollections to a top-level members collection in Firestore.

### Setup

1. Install dependencies:

```bash
npm install
```

2. Make the script executable (Unix/Linux/macOS):

```bash
chmod +x migrateMembers.js
```

3. Make sure you have Firebase Admin SDK credentials. You can:
   - Use application default credentials if running in a Google Cloud environment
   - Download a service account key from Firebase Console:
     - Go to Project Settings > Service Accounts
     - Click "Generate new private key"
     - Save the JSON file in a secure location

### Usage

#### Running a Dry Run

To see what would be migrated without making any changes:

```bash
npm run migrate-dry-run
```

Or with a service account:

```bash
node migrateMembers.js --migrate --dry-run --service-account=/path/to/serviceAccountKey.json
```

#### Performing the Migration

To run the actual migration:

```bash
npm run migrate
```

Or with a service account:

```bash
node migrateMembers.js --migrate --service-account=/path/to/serviceAccountKey.json
```

#### Cleaning Up Old Data

After verifying that the migration was successful, you can clean up the old subcollection data:

```bash
npm run cleanup
```

Or with a service account:

```bash
node migrateMembers.js --cleanup --service-account=/path/to/serviceAccountKey.json
```

⚠️ **WARNING**: The cleanup process is irreversible and will permanently delete all member subcollections. Make sure the migration has been successful before proceeding.

### Output

The script generates JSON files with the results of migrations and cleanups:

- `migration-results-[timestamp].json`
- `cleanup-results-[timestamp].json`

These files contain information about the processed groups, migrated members, and any failures.

## Troubleshooting

- If you encounter authentication errors, make sure your service account has the necessary permissions.
- For large databases, the script might take some time to complete. Consider running it in a stable environment.
- If the migration fails for specific groups or members, check the output logs and the results JSON for details.
