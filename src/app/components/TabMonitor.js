import React from "react";
import { connect } from "react-redux";

const Tab = ({ ports }) => (
  <h1>Monitoring</h1>
);
const mapStateToProps = (state) => ({
  ports: state.device.ports,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Tab);
