import React from "react";
import { connect } from "react-redux";
import PortTable from "./PortTable";

import { device_select } from "../actions/serial";

const TabConnect = ({ ports_available, port, cap, onSelect }) => (
  <React.Fragment>
    <h1>Device</h1>
    <PortTable
      ports={ports_available}
      selected={port}
      onSelect={onSelect}
    />
    <pre>{JSON.stringify(cap, null, 2)}</pre>
  </React.Fragment>
);
const mapStateToProps = (state) => ({
  ports_available: state.serial.ports_available,
  port: state.serial.port,
  cap: state.serial.cap
});

const mapDispatchToProps = (dispatch) => ({
  onSelect: (port) => dispatch(device_select(port)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TabConnect);
