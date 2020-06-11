import { serial_update } from "./actions/serial";
import { ipcRenderer as ipc } from "electron";

export default (store) => {
  ipc.on("serial-ports-update", (event, ports) => {
    store.dispatch(serial_update(ports));
  });
};
