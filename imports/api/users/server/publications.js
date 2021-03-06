import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import '../../projects/projects.js';

/* global Projects:true*/

Meteor.publish('users', function usersPublish() {
  // Return all user documents the current user can view
  const currentUser = Meteor.users.findOne(this.userId);

  if (currentUser == null || currentUser.profile == null) {
    return null;
  }

  if (currentUser.profile.isAdmin) {
    const users = Meteor.users.find();
    return users;
  }
  return Meteor.users.find({ _id: this.userId });
});

Meteor.publish('usersInProject', function projectUsersPublish(projectId) {
  // Given a projectId, return the _id and name of all managers and employees in the project
  check(projectId, String);

  const currentUser = Meteor.users.findOne(this.userId);

  if (currentUser == null || currentUser.profile == null) {
    return null;
  }

  const project = Projects.findOne(projectId);
  if (project != null && (project.managers.indexOf(this.userId) !== -1
      || project.employees.indexOf(this.userId) !== -1
      || currentUser.profile.isAdmin)) {
    const userIds = project.managers.concat(project.employees);
    const users = Meteor.users.find({ _id: { $in: userIds } }, { 'profile.name': 1 });
    return users;
  }
  return null;
});

Meteor.publish('usersNames', function usersNamesPublish(userIdList) {
  // Given a list of userIds, return the name of those users
  check(userIdList, Array);

  const currentUser = Meteor.users.findOne(this.userId);

  if (currentUser == null || currentUser.profile == null) {
    return null;
  }

  const ids = [];
  for (let i = 0; i < userIdList.length; i += 1) {
    if (!userIdList[i].userId) {
      break;
    }
    ids.push(userIdList[i].userId);
  }

  const find = { $or: [{ _id: { $in: ids } }, { _id: { $in: userIdList } }] };
  const projection = { 'profile.name': 1 };
  const names = Meteor.users.find(find, projection);
  return names;
});
