import SerialPort from "serialport";
import TaskQueue from "../lib/taskqueue";
import { call_periodic } from "../lib/tasktime";
import NfcpClient from "../lib/nfcp/nfcp";

const SERIAL_PORT_LIST_INTERVAL = 2000;

class SerialList {
  constructor() {
    this.devices_available = {};
    this.tq = new TaskQueue();
  }

  async _do_refresh(send) {
    const port_list = await SerialPort.list();
    const devices_available = port_list.reduce((obj, item) => {
      obj[item.path] = item;
      return obj;
    }, {});

    /* TODO: Proper comparison */
    if (
      JSON.stringify(Object.keys(devices_available).sort()) !=
      JSON.stringify(Object.keys(this.devices_available).sort())
    ) {
      this.devices_available = devices_available;
      send("device-list-update", this.devices_available);
    }
  }

  page_load(send) {
    /* Clear up state to force a reaload of periodic */
    return this.tq.run(() => {
      this.devices_available = {};
      return this._do_refresh(send);
    });
  }

  periodic(send) {
    return this.tq.run(() => this._do_refresh(send));
  }

  is_device_available(device) {
    return !!this.devices_available[device];
  }
}

const handle_error = (error) => {
  console.error(error);
};

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
  const slist = new SerialList();
  var cli = null;
  var device_selected = null;

  /* Generic function to reply back with an event */
  const send = (...args) => win.webContents.send(...args);

  ipc.on("device-select", (event, device) => {
    device_selected = device;
    if (cli) {
      cli.close();
      cli = null;
    }
    if (device) {
      cli = connect(device_selected);
    }
  });
  ipc.on("page-load", (event) => {
    slist.page_load(send);
    if (cli) {
      send("device-select", sconn.get_path());
    } else {
      send("device-select", null);
    }
  });
  call_periodic(async () => {
    await slist.periodic(send);
    if (
      cli &&
      (!slist.is_device_available(cli.get_path()) || cli.has_timeout())
    ) {
      cli.close();
      cli = null;
    }
    if (!cli && device_selected && slist.is_device_available(device_selected)) {
      cli = connect(device_selected);
    }
  }, SERIAL_PORT_LIST_INTERVAL);
};
