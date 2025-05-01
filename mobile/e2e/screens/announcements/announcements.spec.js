const helpers = require('../../helpers');

describe('Announcements Screen', () => {
  beforeEach(async () => {
    await device.launchApp();
    await helpers.login();
    await helpers.waitAndTap('announcements-tab');
  });

  it('should display announcements list', async () => {
    await helpers.waitForElement('announcements-list');
    await helpers.waitForElement('announcement-item-0');
  });

  it('should filter announcements by type', async () => {
    await helpers.waitAndTap('filter-button');
    await helpers.waitAndTap('filter-urgent');
    await helpers.waitForElement('filtered-announcements-list');
  });

  it('should search announcements', async () => {
    await helpers.waitAndType('search-input', 'Meeting');
    await helpers.waitForElement('search-results');
  });

  it('should view announcement details', async () => {
    await helpers.waitAndTap('announcement-item-0');
    await helpers.waitForElement('announcement-details');
    await helpers.waitForElement('announcement-title');
    await helpers.waitForElement('announcement-content');
    await helpers.waitForElement('announcement-date');
  });

  it('should create new announcement', async () => {
    await helpers.waitAndTap('new-announcement-button');
    await helpers.waitAndType('announcement-title', 'Test Announcement');
    await helpers.waitAndType(
      'announcement-content',
      'This is a test announcement',
    );
    await helpers.waitAndTap('urgent-toggle');
    await helpers.waitAndTap('post-button');
    await helpers.waitForElement('announcement-posted');
  });

  it('should edit announcement', async () => {
    await helpers.waitAndTap('announcement-item-0');
    await helpers.waitAndTap('edit-button');
    await helpers.waitAndType('announcement-content', 'Updated content');
    await helpers.waitAndTap('save-button');
    await helpers.waitForElement('announcement-updated');
  });

  it('should delete announcement', async () => {
    await helpers.waitAndTap('announcement-item-0');
    await helpers.waitAndTap('delete-button');
    await helpers.waitAndTap('confirm-delete-button');
    await helpers.waitForElement('announcement-deleted');
  });

  it('should share announcement', async () => {
    await helpers.waitAndTap('announcement-item-0');
    await helpers.waitAndTap('share-button');
    await helpers.waitForElement('share-sheet');
  });

  it('should handle announcement creation with proper validation', async () => {
    await helpers.waitAndTap('new-announcement-button');

    // Test invalid announcement
    await helpers.waitAndType('announcement-title', '');
    await helpers.waitAndTap('post-button');
    await helpers.waitForElement('validation-error');

    // Test valid announcement
    await helpers.waitAndType('announcement-title', 'Test Announcement');
    await helpers.waitAndType('announcement-content', 'Test Content');
    await helpers.waitAndTap('urgent-toggle');
    await helpers.waitAndTap('post-button');
    await helpers.waitForElement('announcement-posted');
  });

  it('should handle announcement filtering with proper state management', async () => {
    // Test urgent filter
    await helpers.waitAndTap('filter-button');
    await helpers.waitAndTap('filter-urgent');
    await helpers.waitForElement('filtered-announcements-list');

    // Test date filter
    await helpers.waitAndTap('filter-button');
    await helpers.waitAndTap('filter-today');
    await helpers.waitForElement('filtered-announcements-list');

    // Test multiple filters
    await helpers.waitAndTap('filter-button');
    await helpers.waitAndTap('filter-urgent');
    await helpers.waitAndTap('filter-today');
    await helpers.waitForElement('filtered-announcements-list');

    // Test clearing filters
    await helpers.waitAndTap('clear-filters');
    await helpers.waitForElement('all-announcements-list');
  });

  it('should handle announcement search with proper validation', async () => {
    // Test empty search
    await helpers.waitAndType('search-input', '');
    await helpers.waitForElement('all-announcements-list');

    // Test valid search
    await helpers.waitAndType('search-input', 'Meeting');
    await helpers.waitForElement('search-results');

    // Test no results
    await helpers.waitAndType('search-input', 'NonexistentAnnouncement');
    await helpers.waitForElement('no-results-message');
  });

  it('should handle announcement editing with proper permissions', async () => {
    await helpers.waitAndTap('announcement-item-0');

    // Test edit button visibility for non-author
    await helpers.waitForElement('announcement-details');
    await expect(element(by.id('edit-button'))).not.toBeVisible();

    // Test editing own announcement
    await helpers.waitAndTap('my-announcements-button');
    await helpers.waitAndTap('announcement-item-0');
    await helpers.waitAndTap('edit-button');
    await helpers.waitAndType('announcement-content', 'Updated Content');
    await helpers.waitAndTap('save-button');
    await helpers.waitForElement('announcement-updated');
  });

  it('should handle announcement deletion with proper confirmation', async () => {
    await helpers.waitAndTap('my-announcements-button');
    await helpers.waitAndTap('announcement-item-0');

    // Test cancel deletion
    await helpers.waitAndTap('delete-button');
    await helpers.waitAndTap('cancel-delete');
    await helpers.waitForElement('announcement-details');

    // Test confirm deletion
    await helpers.waitAndTap('delete-button');
    await helpers.waitAndTap('confirm-delete');
    await helpers.waitForElement('announcement-deleted');
  });

  it('should handle announcement sharing with proper error handling', async () => {
    await helpers.waitAndTap('announcement-item-0');
    await helpers.waitAndTap('share-button');

    // Test canceling share
    await helpers.waitAndTap('cancel-share');
    await helpers.waitForElement('announcement-details');

    // Test successful share
    await helpers.waitAndTap('share-button');
    await helpers.waitAndTap('share-option');
    await helpers.waitForElement('share-success');
  });

  it('should handle announcement reactions with proper state management', async () => {
    await helpers.waitAndTap('announcement-item-0');

    // Test adding reaction
    await helpers.waitAndTap('like-button');
    await helpers.waitForElement('reaction-added');

    // Test removing reaction
    await helpers.waitAndTap('like-button');
    await helpers.waitForElement('reaction-removed');

    // Test multiple reactions
    await helpers.waitAndTap('heart-button');
    await helpers.waitForElement('reaction-added');
  });

  it('should handle announcement comments with proper validation', async () => {
    await helpers.waitAndTap('announcement-item-0');

    // Test empty comment
    await helpers.waitAndType('comment-input', '');
    await helpers.waitAndTap('post-comment');
    await helpers.waitForElement('validation-error');

    // Test valid comment
    await helpers.waitAndType('comment-input', 'Test Comment');
    await helpers.waitAndTap('post-comment');
    await helpers.waitForElement('comment-posted');

    // Test comment deletion
    await helpers.waitAndTap('delete-comment');
    await helpers.waitAndTap('confirm-delete');
    await helpers.waitForElement('comment-deleted');
  });

  it('should handle announcement notifications with proper settings', async () => {
    await helpers.waitAndTap('settings-button');

    // Test notification toggle
    await helpers.waitAndTap('announcement-notifications-toggle');
    await helpers.waitForElement('settings-saved');

    // Test urgent notification toggle
    await helpers.waitAndTap('urgent-notifications-toggle');
    await helpers.waitForElement('settings-saved');

    // Verify notification settings persist
    await device.reloadReactNative();
    await helpers.login();
    await helpers.waitAndTap('announcements-tab');
    await helpers.waitAndTap('settings-button');
    await helpers.waitForElement('announcement-notifications-toggle');
  });

  it('should handle announcement data persistence after app restart', async () => {
    // Create announcement
    await helpers.waitAndTap('new-announcement-button');
    await helpers.waitAndType('announcement-title', 'Test Announcement');
    await helpers.waitAndType('announcement-content', 'Test Content');
    await helpers.waitAndTap('post-button');
    await helpers.waitForElement('announcement-posted');

    // Restart app and verify announcement persists
    await device.reloadReactNative();
    await helpers.login();
    await helpers.waitAndTap('announcements-tab');
    await helpers.waitForElement('announcement-item-0');
    await expect(element(by.id('announcement-title'))).toHaveText(
      'Test Announcement',
    );
  });
});
