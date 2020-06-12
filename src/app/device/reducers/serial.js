const serial_default = {
  ports_available: {},
  port: null,
  session: null,
};

export default (state = serial_default, action) => {
  switch (action.type) {
    case "DEVICE_LIST_UPDATE":
      return { ...state, ports_available: action.ports };
    case "DEVICE_SELECT":
      return { ...state, port: action.port };
    default:
      return state;
  }
};
