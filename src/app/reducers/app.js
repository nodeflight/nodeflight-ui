const app_default = {
  tab_id: "connect",
};

export default (state = app_default, action) => {
  switch (action.type) {
    case "APP_SET_TAB":
      return { ...state, tab_id: action.tab_id };
    default:
      return state;
  }
};