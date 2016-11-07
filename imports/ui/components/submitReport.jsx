import { Table, TableRow, TableRowColumn, TableBody }
  from 'material-ui/Table';
import { Grid, Row, Col } from 'meteor/lifefilm:react-flexbox-grid';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';

import { hashHistory } from 'react-router';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import Header from './header.jsx';
import '../../api/requests/requests.js';

/* global Requests:true*/
/* eslint no-undef: "error"*/

const React = require('react');

const paperStyle = {
  height: '35px',
  lineHeight: '35px',
  fontFamily: 'Roboto,sans-serif',
  paddingLeft: '24px',
};

const SubmitReport = React.createClass({
  propTypes() {
    return {
      location: React.object,
    };
  },

  getInitialState() {
    return {
      requests: [],
    };
  },

  componentWillMount() {
    Tracker.autorun(() => {
      Meteor.subscribe('requests', () => {
        this.setState({ requests: Requests.find().fetch() });
      });
    });
  },

  showRequest(data, index) {
    const url = `/#/viewRequests/request?id=${data._id}`;
    return (
      <TableRow key={index}>
        <TableRowColumn>{index}</TableRowColumn>
        <TableRowColumn>{data.description}</TableRowColumn>
        <TableRowColumn>
          <a href={url}>
            <FloatingActionButton mini zDepth={1}>
              <i className="material-icons">search</i>
            </FloatingActionButton>
          </a>
        </TableRowColumn>
      </TableRow>
    );
  },

  submitReport() {
    let acceptedRequests = [];
    for (let i = 0; i < requests.length; i += 1) {
      if (requests[i].stat) {
        acceptedRequests.push(requests[i]);
      }
    }
    // TODO:
    // Now send the accepted requests in an api call to the server
  },

  cancel() {
    hashHistory.push('/dashboard');
  },

  render() {
    return (
      <div>
        <Header />
        <Paper style={paperStyle} zDepth={1}>Expense Requests</Paper>
        <br />
        <br />
        <Grid>
          <Row>
            <Col xs={12} sm={12} md={12} lg={12}>
              <Table>
                <TableBody displayRowCheckbox={false}>
                  {this.state.requests.map(this.showRequest)}
                  <TableRow selectable={false}>
                    <TableRowColumn>
                      <button onClick={this.submitReport}>Submit Expense Report</button>
                      <button onClick={this.cancel}>Cancel</button>
                    </TableRowColumn>
                  </TableRow>
                </TableBody>
              </Table>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  },
});

module.exports = SubmitReport;