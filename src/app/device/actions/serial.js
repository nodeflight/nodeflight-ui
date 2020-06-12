import { ipcRenderer as ipc } from "electron";

const device_list_update = (ports) => ({
  type: "DEVICE_LIST_UPDATE",
  ports,
});

const device_do_select = (port) => ({
  type: "DEVICE_SELECT",
  port,
});

const device_select = (port) => (dispatch) => {
  dispatch(device_do_select(port));
  ipc.send("device-select", port);
};

export { device_list_update, device_do_select, device_select };
