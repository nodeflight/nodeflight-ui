import NfcpClient from "../lib/nfcp/nfcp";
import SerialList from "../lib/serial_list";

const connect = (device, send) => {
  const cli = new NfcpClient(device);
  cli.on("info", (pkt) => {
    if (pkt.cls == "mgmt" && pkt.op == "log_message") {
      console.log("log: ", pkt.message);
    }
    send("device-info", pkt);
  });

  cli.on("open", () => send("device-connect", device));
  cli.on("close", () => send("device-disconnect", device));
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
    cur_list = devlist;
    send("device-list-update", cur_list);
  });

  list.on("monitor_add", (dev) => {
    if (cli) {
      cli.close();
    }
    cli = connect(dev, send);
  });

  list.on("monitor_remove", (dev) => {
    if (cli) {
      cli.close();
      cli = null;
    }
  });

  ipc.handle("device-send", async (event, pkt) => {
    try {
      if (cli) {
        return await cli.send(pkt);
      } else {
        throw new Error("not connected");
      }
    } catch (err) {
      return { cls: "error", error: err };
    }
  });

  ipc.on("device-select", (event, device) => {
    list.monitor(device);
    cur_select = device;
  });

  ipc.on("page-load", (event) => {
    send("device-list-update", cur_list);
    send("device-select", cur_select);
    if (cli) {
      /* Reset connection */
      /* TODO: Don't send device-disconnect for previous connection */
      cli.close();
      cli = connect(cur_select, send);
    }
  });
};
