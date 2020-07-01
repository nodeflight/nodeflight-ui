import React from "react";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import ReduxThunk from "redux-thunk";

import { CssBaseline, ThemeProvider } from "@material-ui/core";

import theme from "./theme";
import serial_register from "./serial";

import App from "./components/App";
import rootReducer from "./reducers";

import { ipcRenderer as ipc } from "electron";

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById("root")
);

serial_register(store);

ipc.send("page-load");