import React from "react";
import { connect } from "react-redux";

const Tab = ({ ports }) => (
  <h1>Configuration</h1>
);
const mapStateToProps = (state) => ({
  ports: state.serial.ports,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Tab);