import SerialPort from "serialport";
import TaskQueue from "../lib/taskqueue";
import { call_periodic } from "../lib/tasktime";
import NfcpClient from "../lib/nfcp";

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
      sconn = new NfcpClient(device_selected, send);
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
      sconn = new NfcpClient(device_selected, send);
    }
  }, SERIAL_PORT_LIST_INTERVAL);
};
