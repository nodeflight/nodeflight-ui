import NfcpClient from "../lib/nfcp/nfcp";
import SerialList from "../lib/serial_list";

const connect = (device) => {
  const cli = new NfcpClient(device);
  cli.on("info", (pkt) => {
    if (pkt.cls == "mgmt" && pkt.op == "log_message") {
      console.log(pkt.message);
    } else {
      console.log(pkt);
    }
  });
  return cli;
};

export const serial_init = (ipc, win) => {
  var cli = null;
  var cur_select = null;
  var cur_list = {};

  /* Generic function to reply back with an event */
  const send = (...args) => win.webContents.send(...args);

  
  const list = new SerialList();

  list.on("update", (devlist) => {
    console.log("list updated", devlist);
    cur_list = devlist;
    send("device-list-update", cur_list);
  });

  list.on("monitor_add", (dev) => {
    console.log("monitor_add", dev);
    if(cli) {
      cli.close();
    }
    cli = connect(dev);
  });

  list.on("monitor_remove", (dev) => {
    console.log("monitor_remove", dev);
    if(cli) {
      cli.close();
      cli = null;
    }
  });

  ipc.on("device-select", (event, device) => {
    list.monitor(device);
    cur_select = device;
  });

  ipc.on("page-load", (event) => {
    send("device-list-update", cur_list);
    send("device-select", cur_select);
  });
};
