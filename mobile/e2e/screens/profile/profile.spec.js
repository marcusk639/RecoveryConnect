const helpers = require('../../helpers');

describe('Profile Screen', () => {
  beforeEach(async () => {
    await device.launchApp();
    await helpers.login();
    await helpers.waitAndTap('profile-tab');
  });

  it('should display user profile information', async () => {
    await helpers.waitForElement('profile-header');
    await helpers.waitForElement('user-name');
    await helpers.waitForElement('user-email');
    await helpers.waitForElement('recovery-date');
  });

  it('should update profile information with validation', async () => {
    await helpers.waitAndTap('edit-profile-button');

    // Test invalid display name
    await helpers.waitAndType('display-name-input', '');
    await helpers.waitAndTap('save-profile-button');
    await helpers.waitForElement('error-message');

    // Test valid display name
    await helpers.waitAndType('display-name-input', 'Test User');
    await helpers.waitAndType('phone-input', '1234567890');
    await helpers.waitAndTap('save-profile-button');
    await helpers.waitForElement('profile-update-success');
  });

  it('should handle sobriety date updates with validation', async () => {
    await helpers.waitAndTap('edit-recovery-date-button');

    // Test future date validation
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    await helpers.waitAndTap('date-picker');
    await element(by.id('date-picker')).setDatePickerDate(
      futureDate.toISOString(),
    );
    await helpers.waitAndTap('confirm-date-button');
    await helpers.waitForElement('invalid-date-error');

    // Test valid date
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 1);
    await helpers.waitAndTap('date-picker');
    await element(by.id('date-picker')).setDatePickerDate(
      validDate.toISOString(),
    );
    await helpers.waitAndTap('confirm-date-button');
    await helpers.waitForElement('recovery-date-updated');
  });

  it('should handle notification settings with persistence', async () => {
    await helpers.waitAndTap('notification-settings-button');

    // Test toggling notifications
    await helpers.waitAndTap('meeting-notifications-toggle');
    await helpers.waitAndTap('announcement-notifications-toggle');
    await helpers.waitAndTap('save-notification-settings-button');
    await helpers.waitForElement('notification-settings-updated');

    // Verify persistence
    await device.reloadReactNative();
    await helpers.login();
    await helpers.waitAndTap('profile-tab');
    await helpers.waitAndTap('notification-settings-button');
    await helpers.waitForElement('meeting-notifications-toggle');
    await helpers.waitForElement('announcement-notifications-toggle');
  });

  it('should handle privacy settings with proper state management', async () => {
    await helpers.waitAndTap('privacy-settings-button');

    // Test toggling privacy settings
    await helpers.waitAndTap('show-recovery-date-toggle');
    await helpers.waitAndTap('show-phone-number-toggle');
    await helpers.waitAndTap('save-privacy-settings-button');
    await helpers.waitForElement('privacy-settings-updated');

    // Verify settings are reflected in profile view
    await helpers.waitForElement('profile-header');
    await helpers.waitForElement('recovery-date');
    await helpers.waitForElement('phone-number');
  });

  it('should handle sponsor settings with validation', async () => {
    await helpers.waitAndTap('sponsor-settings-button');

    // Test invalid max sponsees
    await helpers.waitAndType('max-sponsees-input', '0');
    await helpers.waitAndTap('save-sponsor-settings-button');
    await helpers.waitForElement('invalid-sponsees-error');

    // Test valid sponsor settings
    await helpers.waitAndTap('available-to-sponsor-toggle');
    await helpers.waitAndType('max-sponsees-input', '3');
    await helpers.waitAndType(
      'requirements-input',
      '30 days sober, Working the steps',
    );
    await helpers.waitAndType(
      'bio-input',
      'Experienced sponsor with 5 years of sobriety',
    );
    await helpers.waitAndTap('save-sponsor-settings-button');
    await helpers.waitForElement('sponsor-settings-updated');
  });

  it('should handle profile photo updates with proper error handling', async () => {
    await helpers.waitAndTap('change-photo-button');

    // Test canceling photo selection
    await helpers.waitAndTap('cancel-photo-button');
    await helpers.waitForElement('profile-header');

    // Test selecting invalid file type
    await helpers.waitAndTap('change-photo-button');
    await helpers.waitAndTap('choose-photo-button');
    await helpers.waitForElement('invalid-file-type-error');

    // Test successful photo upload
    await helpers.waitAndTap('change-photo-button');
    await helpers.waitAndTap('choose-photo-button');
    await helpers.waitForElement('photo-updated');
  });

  it('should handle profile data persistence after app restart', async () => {
    // Make changes to profile
    await helpers.waitAndTap('edit-profile-button');
    await helpers.waitAndType('display-name-input', 'Test User');
    await helpers.waitAndTap('save-profile-button');
    await helpers.waitForElement('profile-update-success');

    // Restart app and verify changes persist
    await device.reloadReactNative();
    await helpers.login();
    await helpers.waitAndTap('profile-tab');
    await helpers.waitForElement('profile-header');
    await expect(element(by.id('user-name'))).toHaveText('Test User');
  });
});
