import SerialPort from "serialport";
import EventEmitter from "events";
import TaskQueue from "./taskqueue";

const SERIAL_PORT_LIST_INTERVAL = 2000;

class SerialList extends EventEmitter {
  constructor() {
    super({});

    this._tq = new TaskQueue();
    this._devices_available = {};
    this._device_monitored = null;
    this._device_monitored_started = false;
    this._periodic_interval = setInterval(
      () => this._on_periodic(),
      SERIAL_PORT_LIST_INTERVAL
    );
  }

  async _update() {
    const port_list = await SerialPort.list();
    const devices_available = port_list.reduce(
      (obj, item) => ({ ...obj, [item.path]: item }),
      {}
    );
    // Check for list updates
    if (
      JSON.stringify(devices_available) !=
      JSON.stringify(this._devices_available)
    ) {
      this._devices_available = devices_available;
      this.emit("update", this._devices_available);
    }

    // Check for updates for monitored device
    if (this._device_monitored) {
      if (
        this._device_monitored_started &&
        !this._devices_available[this._device_monitored]
      ) {
        this.emit("monitor_remove", this._device_monitored);
        this._device_monitored_started = false;
      } else if (
        !this._device_monitored_started &&
        this._devices_available[this._device_monitored]
      ) {
        this.emit("monitor_add", this._device_monitored);
        this._device_monitored_started = true;
      }
    }
  }

  _on_periodic() {
    this._tq
      .run(() => this._update())
      .catch((err) => console.log("Can't update, periodic", err));
  }

  monitor(device) {
    if (this._device_monitored == device) {
      // No change? Do nothing
      return;
    }

    if (this._device_monitored_started) {
      // Close previous
      this.emit("monitor_remove", this._device_monitored);
      this._device_monitored_started = false;
    }

    this._device_monitored = device;

    this._tq
      .run(() => this._update())
      .catch((err) => console.log("Can't update, set monitor", err));
  }
}

export default SerialList;
