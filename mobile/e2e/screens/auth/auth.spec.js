const helpers = require('../../helpers');

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.launchApp();
  });

  it('should show login screen on app launch', async () => {
    await helpers.waitForElement('login-screen');
  });

  it('should login successfully with valid credentials', async () => {
    await helpers.login();
  });

  it('should show error with invalid credentials', async () => {
    await helpers.waitAndType('email-input', 'invalid@email.com');
    await helpers.waitAndType('password-input', 'wrongpassword');
    await helpers.waitAndTap('login-button');
    await helpers.waitForElement('error-message');
  });

  it('should navigate to forgot password screen', async () => {
    await helpers.waitAndTap('forgot-password-button');
    await helpers.waitForElement('forgot-password-screen');
    await helpers.waitAndType('email-input', TEST_EMAIL);
    await helpers.waitAndTap('reset-password-button');
    await helpers.waitForElement('reset-password-success');
  });

  it('should navigate to signup screen', async () => {
    await helpers.waitAndTap('signup-button');
    await helpers.waitForElement('signup-screen');
    await helpers.waitAndType('email-input', 'newuser@test.com');
    await helpers.waitAndType('password-input', 'Test123!');
    await helpers.waitAndType('confirm-password-input', 'Test123!');
    await helpers.waitAndTap('signup-button');
    await helpers.waitForElement('signup-success');
  });

  it('should logout successfully', async () => {
    await helpers.login();
    await helpers.logout();
  });
});
