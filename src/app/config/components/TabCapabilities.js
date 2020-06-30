import React from "react";
import { connect } from "react-redux";

import CapTable from "../../components/CapTable";

import { config_cap_clear, config_cap_set } from "../actions/config";

import Button from "@material-ui/core/Button";

const Tab = ({ cap, dev_cap, onCapClear, onCapLoadFromDevice }) => (
  <React.Fragment>
    <h1>Capabilities</h1>
    <Button onClick={() => onCapClear()}>Clear</Button>
    <Button
      disabled={!dev_cap.valid}
      onClick={() => onCapLoadFromDevice(dev_cap)}
    >
      Load from device
    </Button>
    <CapTable cap={cap} />
  </React.Fragment>
);
const mapStateToProps = (state) => ({
  cap: state.config.cap,
  dev_cap: state.serial.cap,
});

const mapDispatchToProps = (dispatch) => ({
  onCapClear: () => dispatch(config_cap_clear()),
  onCapLoadFromDevice: (cap) => dispatch(config_cap_set(cap)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Tab);
