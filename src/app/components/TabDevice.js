import React from "react";
import { connect } from "react-redux";
import PortTable from "./PortTable";
import CapTable from "./CapTable";

import { device_select } from "../actions/device";

const TabConnect = ({ ports_available, port, cap, onSelect }) => (
  <React.Fragment>
    <PortTable ports={ports_available} selected={port} onSelect={onSelect} />
    <CapTable cap={cap} />
  </React.Fragment>
);
const mapStateToProps = (state) => ({
  ports_available: state.device.ports_available,
  port: state.device.port,
  cap: state.device.cap,
});

const mapDispatchToProps = (dispatch) => ({
  onSelect: (port) => dispatch(device_select(port)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TabConnect);
