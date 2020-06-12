import { device_list_update } from "./actions/serial";
import { ipcRenderer as ipc } from "electron";

export default (store) => {
  ipc.on("serial-ports-update", (event, ports) => {
    store.dispatch(device_list_update(ports));
  });
};
