const app_default = {
  tab_id: "device",
};

export default (state = app_default, action) => {
  switch (action.type) {
    case "APP_SET_TAB":
      return { ...state, tab_id: action.tab_id };
    default:
      return state;
  }
};