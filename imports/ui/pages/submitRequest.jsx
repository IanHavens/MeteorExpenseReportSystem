import { Meteor } from 'meteor/meteor';
import { Grid, Row, Col } from 'meteor/lifefilm:react-flexbox-grid';
import { hashHistory } from 'react-router';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import Snackbar from 'material-ui/Snackbar';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import Header from '../components/header.jsx';

const React = require('react');

// Styles
const paperStyle = {
  height: '35px',
  lineHeight: '35px',
  fontFamily: 'Roboto,sans-serif',
  paddingLeft: '24px',
};

const SubmitRequest = React.createClass({
  propTypes: {
    projects: React.PropTypes.array,
    isAdmin: React.PropTypes.bool,
  },

  getInitialState() {
    return {
      projects: [],
      projectSelected: '',
      projectSelectedError: '',
      description: '',
      descriptionError: '',
      estimatedCost: '',
      estimatedCostError: '',
      vendor: '',
      vendorError: '',
      qty: '',
      qtyError: '',
      unitCost: '',
      unitCostError: '',
      partNum: '',
      partNumError: '',
      fileUrl: '',
      fileUrlError: '',
      dialogError: '',
      snackbarOpen: false,
    };
  },

  componentWillMount() {
    this.setState({
      projects: this.props.projects,
    });
  },

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user) {
      hashHistory.push('/');
    }

    const projectsChange = this.state.projects !== nextProps.projects;
    this.setState({
      projects: projectsChange ? nextProps.projects : this.state.projects,
    });
  },

  cancelRequest() {
    hashHistory.push('/dashboard');
  },

  submitRequest() {
    this.setState({ dialogError: '' });

    const requiredError = 'This field is required.';
    const numError = 'You must enter a number.';
    let hasError = false;
    if (this.state.projectSelected === '') {
      this.projectError(requiredError);
      hasError = true;
    }

    if (this.state.description === '') {
      this.descriptionError(requiredError);
      hasError = true;
    }

    const estimatedCostNum = +this.state.estimatedCost;
    if (this.state.estimatedCost === '') {
      this.estimateError(requiredError);
      hasError = true;
    } else if (isNaN(estimatedCostNum)) {
      this.estimateError(numError);
      hasError = true;
    }

    if (this.state.vendor === '') {
      this.vendorError(requiredError);
      hasError = true;
    }

    const qtyNum = +this.state.qty;
    if (this.state.qty === '') {
      this.qtyError(requiredError);
      hasError = true;
    } else if (isNaN(qtyNum)) {
      this.qtyError(numError);
      hasError = true;
    }

    const unitCostNum = +this.state.unitCost;
    if (this.state.unitCost === '') {
      this.unitCostError(requiredError);
      hasError = true;
    } else if (isNaN(unitCostNum)) {
      this.unitCostError(numError);
      hasError = true;
    }

    if (this.state.partNum === '') {
      this.partNumError(requiredError);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    Meteor.call('requests.create', this.state.projectSelected,
      this.state.description,
      +estimatedCostNum.toFixed(2),
      this.state.vendor,
      this.state.partNum,
      qtyNum,
      +unitCostNum.toFixed(2),
      this.state.fileUrl,
      (error, result) => {
        if (error != null) {
          this.setState({ dialogError: `Error: ${error.error}. Reason: ${error.reason}` });
          return;
        }
        if (result) {
          this.setState({
            projectSelected: '',
            description: '',
            estimatedCost: '',
            vendor: '',
            partNum: '',
            qty: '',
            unitCost: '',
            fileUrl: '',
            snackbarOpen: true,
          });
        }
      });
  },

  // State Bindings
  // Project select methods
  handleProjectSelect(event, index, value) {
    this.setState({ projectSelected: value, projectSelectedError: '' });
  },

  createProjectMenuItem(item) {
    return (
      <MenuItem value={item._id} primaryText={item.name} />
    );
  },

  projectError(err) {
    this.setState({ projectSelectedError: err });
  },

  // Description methods
  handleDescriptionChange(event) {
    this.setState({ description: event.target.value, descriptionError: '' });
  },

  descriptionError(err) {
    this.setState({ descriptionError: err });
  },

  // Estimated cost methods
  handleEstimateChange(event) {
    this.setState({ estimatedCost: event.target.value, estimatedCostError: '' });
  },

  estimateError(err) {
    this.setState({ estimatedCostError: err });
  },

  // Vendor methods
  handleVendorChange(event) {
    this.setState({ vendor: event.target.value, vendorError: '' });
  },

  vendorError(err) {
    this.setState({ vendorError: err });
  },

  // Quantity methods
  handleQtyChange(event) {
    const newState = {};

    if (this.state.unitCost) {
      newState.estimatedCost = this.state.unitCost * event.target.value;
    }

    newState.qty = event.target.value;
    newState.qtyError = '';

    this.setState(newState);
  },

  qtyError(err) {
    this.setState({ qtyError: err });
  },

  // Unit cost methods
  handleUnitCostChange(event) {
    const newState = {};

    if (this.state.qty) {
      newState.estimatedCost = this.state.qty * event.target.value;
    }

    newState.unitCost = event.target.value;
    newState.unitCostError = '';

    this.setState(newState);
  },

  unitCostError(err) {
    this.setState({ unitCostError: err });
  },

  // Part number methods
  handlePartNumChange(event) {
    this.setState({ partNum: event.target.value, partNumError: '' });
  },

  partNumError(err) {
    this.setState({ partNumError: err });
  },

  // File URL methods
  handleFileUrlChange(event) {
    this.setState({ fileUrl: event.target.value, fileUrlError: '' });
  },

  // Snackbar methods
  handleSnackbarAction() {
    // TODO: change to request view when ready
    hashHistory.push('/dashboard');
  },

  closeSnackbar() {
    this.setState({ snackbarOpen: false });
  },

  render() {
    let noProjectsError = '';
    if (!this.state.projects) {
      noProjectsError = 'You are not a member of any projects! Contact an admin or your manager to be added to a project.';
    }

    return (
      <div>
        <Header isAdmin={this.props.isAdmin} />
        <Paper style={paperStyle} zDepth={1}>Submit a new Request</Paper>
        <br />
        <br />
        <div>
          <Grid>
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Paper style={{ textAlign: 'center', padding: '10px' }} zDepth={1}>
                  <form onSubmit={this.submitRequest}>
                    <SelectField
                      floatingLabelText="Select Project"
                      value={this.state.projectSelected}
                      onChange={this.handleProjectSelect}
                      errorText={noProjectsError}
                      fullWidth
                    >
                      {this.state.projects.map(this.createProjectMenuItem)}
                    </SelectField>
                    <TextField
                      hintText="Description"
                      value={this.state.description}
                      onChange={this.handleDescriptionChange}
                      errorText={this.state.descriptionError}
                      fullWidth
                    />
                    <TextField
                      hintText="Total Cost"
                      value={this.state.estimatedCost}
                      onChange={this.handleEstimateChange}
                      errorText={this.state.estimatedCostError}
                      fullWidth
                      readOnly
                    />
                    <TextField
                      hintText="Vendor Name"
                      value={this.state.vendor}
                      onChange={this.handleVendorChange}
                      errorText={this.state.vendorError}
                      fullWidth
                    />
                    <TextField
                      hintText="Quantity"
                      value={this.state.qty}
                      onChange={this.handleQtyChange}
                      errorText={this.state.qtyError}
                      fullWidth
                    />
                    <TextField
                      hintText="Unit Cost"
                      value={this.state.unitCost}
                      onChange={this.handleUnitCostChange}
                      errorText={this.state.unitCostError}
                      fullWidth
                    />
                    <TextField
                      hintText="Part No."
                      value={this.state.partNum}
                      onChange={this.handlePartNumChange}
                      errorText={this.state.partNumError}
                      fullWidth
                    />
                    <TextField
                      hintText="File URL (optional)"
                      value={this.state.fileUrl}
                      onChange={this.handleFileUrlChange}
                      errorText={this.state.fileUrlError}
                      fullWidth
                    />
                    <div style={{ color: 'red' }}>{this.state.dialogError}</div>
                    <div style={{ float: 'right', margin: '10px' }}>
                      <FlatButton label="Cancel" onTouchTap={this.cancelRequest} />
                      <FlatButton type="submit" label="Submit" primary />
                    </div>
                  </form>
                </Paper>
              </Col>
            </Row>
          </Grid>
          <Snackbar
            open={this.state.snackbarOpen}
            message="Submitted your request"
            autoHideDuration={5000}
            action="view"
            onActionTouchTap={this.handleSnackbarAction}
            onRequestClose={this.closeSnackbar}
          />
        </div>
      </div>
      );
  },
});

module.exports = SubmitRequest;
