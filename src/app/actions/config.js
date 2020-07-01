const config_cap_clear = () => ({
  type: "CONFIG_CAP_CLEAR",
});

const config_cap_set = (cap) => ({
  type: "CONFIG_CAP_SET",
  cap,
});

export { config_cap_clear, config_cap_set };
