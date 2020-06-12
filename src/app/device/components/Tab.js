import React from "react";
import { connect } from "react-redux";
import PortTable from "./PortTable";

import { device_select } from "../actions/serial";

const TabConnect = ({ ports_available, port, onSelect }) => (
  <React.Fragment>
    <h1>Device</h1>
    <PortTable
      ports={ports_available}
      selected={port}
      onSelect={onSelect}
    />
  </React.Fragment>
);
const mapStateToProps = (state) => ({
  ports_available: state.serial.ports_available,
  port: state.serial.port
});

const mapDispatchToProps = (dispatch) => ({
  onSelect: (port) => dispatch(device_select(port)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TabConnect);
