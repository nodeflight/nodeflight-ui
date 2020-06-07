const appDefault = {
    tab_id: 0,
  };
  
  const app = (state = appDefault, action) => {
    switch (action.type) {
      case "APP_SET_TAB":
        return { ...state, tab_id: action.tab_id };
      default:
        return state;
    }
  };
  
  export default app;
  