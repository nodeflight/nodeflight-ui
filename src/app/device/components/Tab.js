import React from "react";
import { connect } from "react-redux";
import PortTable from "./PortTable";
import CapTable from "../../components/CapTable";

import { device_select } from "../actions/serial";

const TabConnect = ({ ports_available, port, cap, onSelect }) => (
  <React.Fragment>
    <PortTable ports={ports_available} selected={port} onSelect={onSelect} />
    <CapTable cap={cap} />
  </React.Fragment>
);
const mapStateToProps = (state) => ({
  ports_available: state.serial.ports_available,
  port: state.serial.port,
  cap: state.serial.cap,
});

const mapDispatchToProps = (dispatch) => ({
  onSelect: (port) => dispatch(device_select(port)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TabConnect);
