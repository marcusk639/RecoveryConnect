const TEST_EMAIL = 'marcusk639@gmail.com';
const TEST_PASSWORD = 'sublime1qaz!QAZ';

const helpers = {
  async login() {
    await element(by.id('email-input')).typeText(TEST_EMAIL);
    await element(by.id('password-input')).typeText(TEST_PASSWORD);
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  },

  async logout() {
    await element(by.id('profile-tab')).tap();
    await element(by.id('settings-button')).tap();
    await element(by.id('logout-button')).tap();
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);
  },

  async waitAndTap(elementId, timeout = 5000) {
    await waitFor(element(by.id(elementId)))
      .toBeVisible()
      .withTimeout(timeout);
    await element(by.id(elementId)).tap();
  },

  async waitAndType(elementId, text, timeout = 5000) {
    await waitFor(element(by.id(elementId)))
      .toBeVisible()
      .withTimeout(timeout);
    await element(by.id(elementId)).typeText(text);
  },

  async waitForElement(elementId, timeout = 5000) {
    await waitFor(element(by.id(elementId)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  async scrollToElement(elementId, scrollViewId, direction = 'down') {
    await waitFor(element(by.id(scrollViewId))).toBeVisible();
    await element(by.id(scrollViewId)).scrollTo(direction);
    await waitFor(element(by.id(elementId))).toBeVisible();
  },
};

module.exports = helpers;
