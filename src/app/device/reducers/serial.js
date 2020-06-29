const default_cap = {
  connected: false,
  cpu_type: "none",
  cpu_speed_mhz: 1,
  rs: {},
  pp: {},
  md: {},
};

const serial_default = {
  ports_available: {},
  port: null,
  session: null,
  cap: default_cap,
};

export default (state = serial_default, action) => {
  switch (action.type) {
    case "DEVICE_LIST_UPDATE":
      return { ...state, ports_available: action.ports };
    case "DEVICE_SELECT":
      return { ...state, port: action.port };
    case "DEVICE_DISCONNECT":
      return { ...state, cap: default_cap };
    case "DEVICE_CAP_CLEAR":
      return { ...state, cap: default_cap };
    case "DEVICE_CAP_SET":
      return { ...state, cap: action.cap };
    default:
      return state;
  }
};
