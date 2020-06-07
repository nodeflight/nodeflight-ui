import { serial_list } from "./serial";

export const appSetTab = (tab_id) => (dispatch) => {
  dispatch({
    type: "APP_SET_TAB",
    tab_id,
  });
  switch (tab_id) {
    case "connect":
      dispatch(serial_list());
      break;
  }
};
