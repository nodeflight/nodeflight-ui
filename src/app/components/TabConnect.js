import React from "react";
import { connect } from "react-redux";

const TabConnect = ({ ports }) => (
  <ul>
    {ports.map((port, idx) => (
      <li key={idx}>{port.path}</li>
    ))}
  </ul>
);
const mapStateToProps = (state) => ({
  ports: state.serial.ports,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TabConnect);
