import SerialPort from "serialport";
import TaskQueue from "../lib/taskqueue";
import { delay, call_periodic } from "../lib/tasktime";

const SERIAL_PORT_LIST_INTERVAL = 2000;

const SERIAL_PORT_CONFIG = {
  baudRate: 230400,
  parity: "none",
  stopBits: 1,
  dataBits: 8,
  flowControl: false,
};

class SerialConnection {
  constructor(device) {
    this.device = device;
    console.log("Connect", this.device);
  }

  close() {
    console.log("Close connection", this.device);
  }
}

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
}

const handle_error = (error) => {
  console.error(error);
};

export const serial_init = (ipc, win) => {
  const slist = new SerialList();
  var sconn = null;

  /* Generic function to reply back with an event */
  const send = (...args) => win.webContents.send(...args);

  ipc.on("device-select", (event, device) => {
    if (sconn) {
      sconn.close();
      sconn = null;
    }
    if (device) {
      sconn = new SerialConnection(device);
    }
  });
  ipc.on("page-load", (event) => {
    slist.page_load(send);
    if (sconn) {
      send("device-select", sconn.device);
    } else {
      send("device-select", null);
    }
  });
  call_periodic(() => slist.periodic(send), SERIAL_PORT_LIST_INTERVAL);
};
