import { device_list_update, device_do_select } from "./actions/serial";
import { ipcRenderer as ipc } from "electron";

export default (store) => {
  ipc.on("device-list-update", (event, ports) => {
    store.dispatch(device_list_update(ports));
  });
  ipc.on("device-select", (event, port) => {
    console.log("select", port);
    store.dispatch(device_do_select(port));
  });
  ipc.on("device-connect", (event, port) => {
    console.log("connect", port);
  });
  ipc.on("device-disconnect", (event, port) => {
    console.log("disconnect", port);
  });
};
