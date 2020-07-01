const default_cap = {
  valid: false,
  cpu_type: "none",
  cpu_speed_mhz: 1,
  rs: {},
  pp: {},
  md: {},
};

const config_default = {
  cap: default_cap,
};

export default (state = config_default, action) => {
  switch (action.type) {
    case "CONFIG_CAP_CLEAR":
      return { ...state, cap: default_cap };
    case "CONFIG_CAP_SET":
      return { ...state, cap: action.cap };
    default:
      return state;
  }
};
