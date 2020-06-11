const serial_default = {
  ports: [],
  session: null
};

export default (state = serial_default, action) => {
  switch (action.type) {
    case "SERIAL_PORTS_UPDATE":
      return { ...state, ports: action.ports };
    default:
      return state;
  }
};
