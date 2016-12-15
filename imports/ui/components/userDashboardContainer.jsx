import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import UserDashboardPage from '../pages/userDashboard.jsx';

/* global Requests Projects:true*/
/* eslint no-undef: "error"*/

const UserDashboardContainer = createContainer(() => {
  const user = Meteor.user();
  const profile = user && user.profile;
  const isAdmin = profile && profile.isAdmin;
  const name = profile && profile.name;

  // Subscriptions
  const projectSub = Meteor.subscribe('projects');
  const requestSub = Meteor.subscribe('requests');
  let userNameSub = null;

  // Subscription ready
  const projectReady = projectSub.ready();
  const requestReady = requestSub.ready();
  let userReady = null;

  // Projects and Requests
  const employeeProjects = (projectReady && user &&
    Projects.find({ employees: user._id }).fetch()) || [];
  const managerProjects = (projectReady && user &&
    Projects.find({ managers: user._id }).fetch()) || [];
  const myRequests = (requestReady && user &&
    Requests.find({ userId: user._id }).fetch()) || [];
  const managerRequests = (requestReady && user &&
    Requests.find({ userId: { $not: user._id } }).fetch()) || [];
  const requestUserIds = requestReady &&
    Requests.find({}, { fields: { userId: 1 } }).fetch();
  let users = [];
  if (requestUserIds) {
    userNameSub = Meteor.subscribe('usersNames', requestUserIds);
    userReady = userNameSub.ready();
    users = (userReady && Meteor.users.find().fetch()) || [];
  }

  // Helper props
  const isEmployee = employeeProjects && employeeProjects.length > 0;
  const isManager = managerProjects && managerProjects.length > 0;

  return {
    user: !!user || false,
    isAdmin,
    name,
    employeeProjects,
    managerProjects,
    myRequests,
    managerRequests,
    users,
    isManager,
    isEmployee,
  };
}, UserDashboardPage);

module.exports = UserDashboardContainer;
