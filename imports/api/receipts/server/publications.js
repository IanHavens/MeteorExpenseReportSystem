/* global Receipts:true*/
/* eslint no-undef: "error"*/


import { Meteor } from 'meteor/meteor';
import '../receipts.js';
import '../../requests/requests.js';


Meteor.publish('receipts', function receiptsPublish() {
  const currentUser = Meteor.users.findOne(this.userId);

  if (currentUser == null || currentUser.profile == null) {
    return null;
  }

  const receipts = Receipts.find({ owner: this.userId });

  return receipts;
});