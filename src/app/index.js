import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";

import { Button } from "@material-ui/core";

const store = createStore((state = {}, action) => state);

ReactDOM.render(
  <Provider store={store}>
    <Button>A button</Button>
  </Provider>,
  document.getElementById("root")
);
