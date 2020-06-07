import React from "react";
import { connect } from "react-redux";

import { appSetTab } from "../actions/app";

import { Tabs, Tab } from "@material-ui/core";

import TabAbout from "./TabAbout";
import TabConnect from "./TabConnect";

const tabcontents = {
  about: () => <TabAbout />,
  connect: () => <TabConnect />,
  tab_two: () => <div>TabTwo</div>,
  tab_three: () => <div>TabThree</div>,
};

const App = ({ tab_id, setTab }) => (
  <React.Fragment>
    <Tabs value={tab_id} onChange={(ev, val) => setTab(val)}>
      <Tab value="about" label="About" />
      <Tab value="connect" label="Connection" />
      <Tab value="tab_two" label="Item Two" />
      <Tab value="tab_three" label="Item Three" />
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
