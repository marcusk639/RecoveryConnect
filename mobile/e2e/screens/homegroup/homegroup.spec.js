const helpers = require('../../helpers');

describe('Homegroup Screen', () => {
  beforeEach(async () => {
    await device.launchApp();
    await helpers.login();
    await helpers.waitAndTap('homegroup-tab');
  });

  it('should display homegroup information', async () => {
    await helpers.waitForElement('homegroup-header');
    await helpers.waitForElement('homegroup-name');
    await helpers.waitForElement('homegroup-location');
    await helpers.waitForElement('homegroup-meeting-time');
  });

  it('should view homegroup members', async () => {
    await helpers.waitAndTap('members-button');
    await helpers.waitForElement('members-list');
    await helpers.waitForElement('member-item-0');
  });

  it('should view member details', async () => {
    await helpers.waitAndTap('members-button');
    await helpers.waitAndTap('member-item-0');
    await helpers.waitForElement('member-details');
    await helpers.waitForElement('member-name');
    await helpers.waitForElement('member-sobriety-date');
  });

  it('should send message to member', async () => {
    await helpers.waitAndTap('members-button');
    await helpers.waitAndTap('member-item-0');
    await helpers.waitAndTap('message-button');
    await helpers.waitAndType('message-input', 'Hello, how are you?');
    await helpers.waitAndTap('send-button');
    await helpers.waitForElement('message-sent');
  });

  it('should view homegroup announcements', async () => {
    await helpers.waitAndTap('announcements-button');
    await helpers.waitForElement('announcements-list');
    await helpers.waitForElement('announcement-item-0');
  });

  it('should create new announcement', async () => {
    await helpers.waitAndTap('announcements-button');
    await helpers.waitAndTap('new-announcement-button');
    await helpers.waitAndType('announcement-title', 'Test Announcement');
    await helpers.waitAndType(
      'announcement-content',
      'This is a test announcement',
    );
    await helpers.waitAndTap('post-button');
    await helpers.waitForElement('announcement-posted');
  });

  it('should view homegroup events', async () => {
    await helpers.waitAndTap('events-button');
    await helpers.waitForElement('events-list');
    await helpers.waitForElement('event-item-0');
  });

  it('should RSVP to event', async () => {
    await helpers.waitAndTap('events-button');
    await helpers.waitAndTap('event-item-0');
    await helpers.waitAndTap('rsvp-button');
    await helpers.waitAndTap('rsvp-yes');
    await helpers.waitForElement('rsvp-confirmed');
  });
});
