import React from "react";
import { connect } from "react-redux";

import { appSetTab } from "../actions/app";

import { Tabs, Tab } from "@material-ui/core";


const App = ({ tab_id, setTab }) => (
  <React.Fragment>
    <Tabs value={tab_id} onChange={(ev, val) => setTab(val)}>
      <Tab label="Connection" />
      <Tab label="Item Two" />
      <Tab label="Item Three" />
    </Tabs>
    <div>test</div>
  </React.Fragment>
);

const mapStateToProps = (state) => ({
  tab_id: state.app.tab_id,
});

const mapDispatchToProps = (dispatch) => ({
  setTab: (id) => dispatch(appSetTab(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
