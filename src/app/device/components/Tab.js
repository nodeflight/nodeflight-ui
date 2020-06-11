import React from "react";
import { connect } from "react-redux";

const TabConnect = ({ ports }) => (
  <React.Fragment>
    <h1>Device</h1>
    <ul>
      {ports.map((port, idx) => (
        <li key={idx}>{port.path}</li>
      ))}
    </ul>
  </React.Fragment>
);
const mapStateToProps = (state) => ({
  ports: state.serial.ports,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TabConnect);
