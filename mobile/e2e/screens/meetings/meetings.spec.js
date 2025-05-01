const helpers = require('../../helpers');

describe('Meetings Screen', () => {
  beforeEach(async () => {
    await device.launchApp();
    await helpers.login();
    await helpers.waitAndTap('meetings-tab');
  });

  it('should display meetings list with proper sorting and filtering', async () => {
    await helpers.waitForElement('meetings-list');
    await helpers.waitForElement('meeting-item-0');

    // Test distance-based sorting
    await helpers.waitAndTap('sort-by-distance');
    await helpers.waitForElement('sorted-meetings-list');

    // Test time-based sorting
    await helpers.waitAndTap('sort-by-time');
    await helpers.waitForElement('sorted-meetings-list');
  });

  it('should handle location-based meeting filtering', async () => {
    // Test current location
    await helpers.waitAndTap('use-current-location');
    await helpers.waitForElement('location-permission-dialog');
    await helpers.waitAndTap('allow-location');
    await helpers.waitForElement('meetings-near-you');

    // Test custom location
    await helpers.waitAndTap('custom-location-button');
    await helpers.waitAndType('location-search', 'New York, NY');
    await helpers.waitAndTap('select-location');
    await helpers.waitForElement('meetings-near-location');

    // Test radius adjustment
    await helpers.waitAndTap('adjust-radius');
    await element(by.id('radius-slider')).setSliderPosition(0.5);
    await helpers.waitAndTap('apply-radius');
    await helpers.waitForElement('filtered-meetings-list');
  });

  it('should handle meeting type filtering with proper state management', async () => {
    await helpers.waitAndTap('filter-button');

    // Test single type filter
    await helpers.waitAndTap('filter-aa');
    await helpers.waitForElement('filtered-meetings-list');

    // Test multiple type filters
    await helpers.waitAndTap('filter-na');
    await helpers.waitForElement('filtered-meetings-list');

    // Test clearing filters
    await helpers.waitAndTap('clear-filters');
    await helpers.waitForElement('all-meetings-list');
  });

  it('should handle meeting search with proper validation', async () => {
    // Test empty search
    await helpers.waitAndType('search-input', '');
    await helpers.waitForElement('all-meetings-list');

    // Test valid search
    await helpers.waitAndType('search-input', 'Morning');
    await helpers.waitForElement('search-results');

    // Test no results
    await helpers.waitAndType('search-input', 'NonexistentMeeting');
    await helpers.waitForElement('no-results-message');
  });

  it('should handle meeting details with proper data display', async () => {
    await helpers.waitAndTap('meeting-item-0');
    await helpers.waitForElement('meeting-details-screen');

    // Verify all required information is displayed
    await helpers.waitForElement('meeting-title');
    await helpers.waitForElement('meeting-time');
    await helpers.waitForElement('meeting-location');
    await helpers.waitForElement('meeting-type');
    await helpers.waitForElement('meeting-format');
    await helpers.waitForElement('meeting-notes');
  });

  it('should handle meeting favorites with persistence', async () => {
    await helpers.waitAndTap('meeting-item-0');
    await helpers.waitAndTap('favorite-button');
    await helpers.waitForElement('favorite-added');

    // Verify favorite persists after app restart
    await device.reloadReactNative();
    await helpers.login();
    await helpers.waitAndTap('meetings-tab');
    await helpers.waitAndTap('favorites-tab');
    await helpers.waitForElement('favorite-meeting-0');
  });

  it('should handle meeting sharing with proper error handling', async () => {
    await helpers.waitAndTap('meeting-item-0');
    await helpers.waitAndTap('share-button');

    // Test canceling share
    await helpers.waitAndTap('cancel-share');
    await helpers.waitForElement('meeting-details-screen');

    // Test successful share
    await helpers.waitAndTap('share-button');
    await helpers.waitAndTap('share-option');
    await helpers.waitForElement('share-success');
  });

  it('should handle meeting directions with proper error handling', async () => {
    await helpers.waitAndTap('meeting-item-0');
    await helpers.waitAndTap('directions-button');

    // Test no maps app installed
    await helpers.waitForElement('no-maps-app-error');

    // Test successful directions
    await helpers.waitAndTap('open-maps');
    await helpers.waitForElement('maps-app');
  });

  it('should handle meeting notes with proper persistence', async () => {
    await helpers.waitAndTap('meeting-item-0');
    await helpers.waitAndTap('notes-button');

    // Test adding notes
    await helpers.waitAndType('notes-input', 'Test meeting notes');
    await helpers.waitAndTap('save-notes');
    await helpers.waitForElement('notes-saved');

    // Verify notes persist
    await helpers.waitAndTap('notes-button');
    await expect(element(by.id('notes-content'))).toHaveText(
      'Test meeting notes',
    );
  });

  it('should handle offline mode with proper data caching', async () => {
    // Enable offline mode
    await device.setURLBlacklist(['.*']);

    // Verify cached meetings are displayed
    await helpers.waitForElement('meetings-list');
    await helpers.waitForElement('offline-indicator');

    // Test offline search
    await helpers.waitAndType('search-input', 'Morning');
    await helpers.waitForElement('cached-search-results');

    // Re-enable online mode
    await device.setURLBlacklist([]);
    await helpers.waitForElement('online-indicator');
  });
});
