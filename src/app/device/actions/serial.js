const device_list_update = (ports) => ({
  type: "DEVICE_LIST_UPDATE",
  ports,
});

const device_select = (port) => ({
  type: "DEVICE_SELECT",
  port,
});

export { device_list_update, device_select };
