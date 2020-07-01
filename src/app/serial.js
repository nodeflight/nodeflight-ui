import {
  device_list_update,
  device_connect,
  device_disconnect,
  device_do_select,
} from "./actions/device";
import { ipcRenderer as ipc } from "electron";

export default (store) => {
  ipc.on("device-list-update", (event, ports) => {
    store.dispatch(device_list_update(ports));
  });
  ipc.on("device-select", (event, port) => {
    console.log("select", port);
    store.dispatch(device_do_select(port));
  });
  ipc.on("device-info", (event, pkt) => {
    if (pkt.cls == "mgmt" && pkt.op == "log_message") {
      console.log("log", pkt.context, pkt.message);
    } else {
      console.log("device-info", pkt);
    }
  });
  ipc.on("device-connect", (event, port) => {
    console.log("device-connect", port);
    store.dispatch(device_connect(port));
  });
  ipc.on("device-disconnect", (event, port) => {
    console.log("device-disconnect", port);
    store.dispatch(device_disconnect(port));
  });
};
