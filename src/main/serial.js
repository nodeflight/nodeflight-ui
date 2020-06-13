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
  constructor(device, send) {
    this.send = send;
    this.port = new SerialPort(device, {
      ...SERIAL_PORT_CONFIG,
      autoOpen: true,
    });
    this.port.on("open", () => this._on_open());
    this.port.on("close", () => this._on_close());
    this.port.on("error", (error) => this._on_error(error));
    this.port.on("data", (buffer) => this._on_data(buffer));
    this.port.on("drain", () => this._on_drain());
  }

  close() {
    this.port.close();
    this.port = null;
  }

  get_device() {
    return this.port.path;
  }

  _on_open() {
    console.log("_on_open");
  }
  _on_close() {
    console.log("_on_close");
  }
  _on_error(error) {
    console.log("_on_error", error);
  }
  _on_data(buffer) {
    console.log("_on_data", buffer);
  }
  _on_drain() {
    console.log("_on_drain");
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

  is_device_available(device) {
    return !!this.devices_available[device];
  }
}

const handle_error = (error) => {
  console.error(error);
};

export const serial_init = (ipc, win) => {
  const slist = new SerialList();
  var sconn = null;
  var device_selected = null;

  /* Generic function to reply back with an event */
  const send = (...args) => win.webContents.send(...args);

  ipc.on("device-select", (event, device) => {
    device_selected = device;
    if (sconn) {
      sconn.close();
      sconn = null;
    }
    if (device) {
      sconn = new SerialConnection(device_selected, send);
    }
  });
  ipc.on("page-load", (event) => {
    slist.page_load(send);
    if (sconn) {
      send("device-select", sconn.get_device());
    } else {
      send("device-select", null);
    }
  });
  call_periodic(async () => {
    await slist.periodic(send);
    if (sconn && !slist.is_device_available(sconn.get_device())) {
      sconn.close();
      sconn = null;
    }
    if (
      !sconn &&
      device_selected &&
      slist.is_device_available(device_selected)
    ) {
      sconn = new SerialConnection(device_selected, send);
    }
  }, SERIAL_PORT_LIST_INTERVAL);
};
