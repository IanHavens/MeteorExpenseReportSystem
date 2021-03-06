import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import SubmitReportPage from '../pages/submitReport.jsx';

/* global Requests:true*/
/* eslint no-undef: "error"*/

const SubmitReportContainer = createContainer(() => {
  const user = Meteor.user();
  const profile = user && user.profile;
  const isAdmin = profile && profile.isAdmin;
  const requestSub = Meteor.subscribe('requests');
  const requestReady = requestSub.ready();
  const requests = requestReady && Requests.find().fetch();
  return {
    user: !!user || false,
    isAdmin,
    requestReady,
    requests: requests || [],
  };
}, SubmitReportPage);

module.exports = SubmitReportContainer;
