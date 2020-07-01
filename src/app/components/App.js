import React from "react";
import { connect } from "react-redux";

import { appSetTab } from "../actions/app";

import { Tabs, Tab } from "@material-ui/core";

import TabAbout from "./TabAbout";
import TabDevice from "./TabDevice";
import TabConfig from "./TabConfig";
import TabCapabilities from "./TabCapabilities";
import TabMonitor from "./TabMonitor";

const tabcontents = {
  about: () => <TabAbout />,
  device: () => <TabDevice />,
  capabilities: () => <TabCapabilities />,
  config: () => <TabConfig />,
  monitor: () => <TabMonitor />,
};

const App = ({ tab_id, setTab }) => (
  <React.Fragment>
    <Tabs value={tab_id} onChange={(ev, val) => setTab(val)}>
      <Tab value="about" label="About" />
      <Tab value="device" label="Device" />
      <Tab value="capabilities" label="Capabilities" />
      <Tab value="config" label="Configuration" />
      <Tab value="monitor" label="Monitoring" />
    </Tabs>
    {tabcontents[tab_id]()}
  </React.Fragment>
);

const mapStateToProps = (state) => ({
  tab_id: state.app.tab_id,
});

const mapDispatchToProps = (dispatch) => ({
  setTab: (id) => dispatch(appSetTab(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
