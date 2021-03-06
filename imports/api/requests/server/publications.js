import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import '../requests.js';

/* global Requests Projects:true*/
/* eslint no-undef: "error"*/

Meteor.publish('requests', function requestsPublish() {
  const currentUser = Meteor.users.findOne(this.userId);

  if (currentUser == null || currentUser.profile == null) {
    return null;
  }

  if (currentUser.profile.isAdmin) {
    const requests = Requests.find();
    return requests;
  }

  const projects = Projects.find({ managers: this.userId }, { _id: 1 }).fetch();
  const projectIds = [];

  for (let i = 0; i < projects.length; i += 1) {
    projectIds.push(projects[i]._id);
  }

  const requests = Requests.find({ $or:
  [{ userId: this.userId },
    { projectId: { $in: projectIds },
    }],
  });
  return requests;
});

Meteor.publish('requestOne', function retrieveRequest(requestId) {
  check(requestId, String);

  const currentUser = Meteor.users.findOne(this.userId);
  if (currentUser == null || currentUser.profile == null) {
    return null;
  }

  // if (currentUser.profile.isAdmin) {
  //   const reports = Reports.find();
  //   return reports;
  // }

  const request = Requests.find({ $and: [{ _id: requestId },
    { userId: this.userId }] });
  return request;
});
