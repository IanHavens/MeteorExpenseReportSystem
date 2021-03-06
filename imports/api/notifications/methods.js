import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import './notifications.js';

/* global Notifications:true*/
/* eslint no-undef: "error"*/

const monthNames = ['January', 'Feburary', 'March', 'April',
  'May', 'June', 'July', 'August', 'September', 'October',
  'November', 'December'];

Meteor.methods({
  /**
  Creates a new notification.
  @param users {Array} the IDs of the users to notify
  @param intext {String} the text of the notification
  @param url {String} the URL that the notification links to
  @return {Boolean} true if insert was successful
  */
  'notifications.create': function createNotif(users, intext, url, req, tagIn) {
    check(users, Array);
    check(req, String);
    check(intext, String);
    check(url, String);
    check(tagIn, String);
    const newNoti = {
      userIds: users,
      reqId: req,
      text: intext,
      URL: url,
      isRead: false,
      bornOn: new Date(),
      tag: tagIn,
    };
    Notifications.schema.validate(newNoti);
    const result = Notifications.insert(newNoti);
    return result;
  },

  /**
  Sets notification status to has been read.
  @param notiId {String} the notification's ID
  @return {Boolean} true if exactly one notification was updated
  */
  'notifications.updateRead': function setRead(notiId) {
    check(notiId, String);

    const result = Notifications.update({ _id: notiId },
        { $set: { isRead: true } });

    return result.nModified === 1;
  },

  /**
  Helper method to notify all managers of a project.
  @param proj {String} the project's name
  @param managers {Array} list of manager IDs for the project
  @param reqId {String} the request's ID for URL creation
  */
  'notifications.createHelper': function helpCreate(proj, managers, reqId) {
    let i = 0;
    const currentUser = Meteor.user();
    const filteredMngrs = [];
    const tag = 'mpa';
    check(proj, String);
    check(managers, Array);
    check(reqId, String);
    for (i = 0; i < managers.length; i += 1) {
      if (currentUser._id !== managers[i]) {
        filteredMngrs.push(managers[i]);
      }
    }
    const targetURL = `/requestDetail/${reqId}`;
    const noteText = `${currentUser.profile.name} has created a request for the project: ${proj}`;
    // for (i = 0; i < managers.length; i += 1) {
    Meteor.call('notifications.create', filteredMngrs, noteText, targetURL, reqId, tag);
    // }
  },

  /**
  Helper method for notifying that a request was approved/denied.
  @param state {Boolean} true if the request was approved, else denied
  @param reqId {String} the request's ID for URL creation
  @param reqUser {String} the ID of the user who created the request
  */
  'notifications.respondHelper': function respondCreate(state, reqId, reqUser) {
    let reply = 'denied';
    const reqUserArray = [];
    const currentUser = Meteor.user();
    const tag = 'mpa';
    check(state, Boolean);
    check(reqId, String);
    check(reqUser, String);
    reqUserArray.push(reqUser);
    if (state) {
      reply = 'approved';
    }
    const targetURL = `/requestDetail/${reqId}`;
    const noteText = `${currentUser.profile.name} has ${reply} your request`;
    Meteor.call('notifications.create', reqUserArray, noteText, targetURL, reqId, tag);
  },

  /**
  Helper method for request resubmission.
  @param proj {String} the project's name
  @param managers {Array} list of manager IDs for the project
  @param reqId {String} the request's ID for URL creation
  */
  'notifications.createEditHelper': function helpEditCreate(proj, managers, reqId) {
    let i = 0;
    const currentUser = Meteor.user();
    const filteredMngrs = [];
    const tag = 'mpa';
    check(proj, String);
    check(managers, Array);
    check(reqId, String);
    for (i = 0; i < managers.length; i += 1) {
      if (currentUser._id !== managers[i]) {
        filteredMngrs.push(managers[i]);
      }
    }
    const targetURL = `/requestDetail/${reqId}`;
    const noteText = `${currentUser.profile.name} has resubmitted a request for the project: ${proj}`;
    Meteor.call('notifications.create', managers, noteText, targetURL, reqId, tag);
  },

  /**
  Helper method to send notifications for submission of MERs
  @param tag {String} type of notification to create
  */
  'notifications.submitReportHelper': function reportNotiCreate(tag, monthNum) {
    check(tag, String);
    check(monthNum, Number);
    const monthName = monthNames[monthNum];
    let noteText = '';
    if (tag === 'mer1') {
      noteText = `Last day to submit MER for month of ${monthName}!`;
    } else if (tag === 'mer2') {
      noteText = `2 days to submit MER for month of ${monthName}.`;
    } else if (tag === 'mer3') {
      noteText = `3 days to submit MER for month of ${monthName}.`;
    } else {
      noteText = 'This text should not be seen!';
    }
    const currentUser = Meteor.user()._id;
    const notiUserArray = [];
    const targetURL = '/dashboard';
    notiUserArray.push(currentUser);
    if (Meteor.call('notifications.notiCheck', notiUserArray, tag)) {
      return;
    }
    Meteor.call('notifications.create', notiUserArray, noteText, targetURL, currentUser, tag);
  },

  'notifications.notiCheck': function checkNotiExists(userArray, tagType) {
    check(tagType, String);
    check(userArray, Array);
    const userNotis = Notifications.findOne({ userIds: userArray, tag: tagType });
    if (userNotis) {
      return true;
    }
    return false;
  },
});
