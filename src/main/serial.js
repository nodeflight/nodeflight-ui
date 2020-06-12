import SerialPort from "serialport";

const SERIAL_PORT_LIST_INTERVAL = 2000;

const initial_state = {
  ports_available: {},
  port_selected: null,
  port_connected: null,
};

/**
 * Connect to a serial port
 * 
 * @param {*} send 
 * @param {*} state 
 * @param {*} port 
 */
const device_connect = (send, state, port) => {
  state.port_connected = state.port_selected;
  console.log("connect", state.port_connected);
  send("device-connect", state.port_connected);
};

const device_disconnect = (send, state, port) => {
  console.log("disconnect", state.port_connected);
  send("device-disconnect", state.port_connected);
  state.port_connected = null;
};

/**
 * Check if the connection state should be updated
 *
 * Track the selected port and the port list, to determine it should connect or disconnect
 *
 * @param {*} send function to send an event to the renderer
 * @param {*} state current state, can be updated
 */
const update_connection = (send, state) => {
  const selected_available =
    state.port_selected && !!state.ports_available[state.port_selected];

  if (
    state.port_connected &&
    (!selected_available || state.port_connected != state.port_available)
  ) {
    device_disconnect(send, state, state.port_connected);
  }

  if (!state.port_connected && selected_available) {
    device_connect(send, state, state.port_selected);
  }
};

/**
 * When a serial device is plugged in or removed
 *
 * @param {*} send function to send an event to the renderer
 * @param {*} state current state, can be updated
 */
const on_list_update = (send, state) => {
  send("device-list-update", state.ports_available);
  update_connection(send, state);
};

/**
 * When renderer change device selection
 *
 * @param {*} send function to send an event to the renderer
 * @param {*} state current state, can be updated
 * @param {*} port updated port
 */
const on_port_select = (send, state, port) => {
  state.port_selected = port;
  if(state.port_connected) {

  }
  update_connection(send, state);
};

/**
 * Periodic polling
 *
 * Check for available serial ports, and if list is updated, trigger a list update event
 *
 * @param {*} send function to send an event to the renderer
 * @param {*} state current state, can be updated
 */
const on_periodic = async (send, state) => {
  const port_list = await SerialPort.list();
  const ports_available = port_list.reduce((obj, item) => {
    obj[item.path] = item;
    return obj;
  }, {});

  /* TODO: Proper comparison */
  if (
    JSON.stringify(Object.keys(ports_available).sort()) !=
    JSON.stringify(Object.keys(state.ports_available).sort())
  ) {
    state.ports_available = ports_available;
    on_list_update(send, state);
  }
};

/**
 * Page load event, sent by the page itself
 *
 * Used to clear parameters that forces the state to be updated
 *
 * @param {*} send
 * @param {*} state
 */
const on_page_load = (send, state) => {
  if(state.port_connected) {
    device_disconnect(send, state, state.port_connected);
  }
  /* a clean window doesn't know about the ports, so clear to force an update next periodic */
  state.ports_available = {};
  console.log("page-load");
};

export const serial_init = (ipc, win) => {
  let state = {...initial_state};

  ipc.on("device-select", (event, port) =>
    on_port_select(
      (event, ...args) => win.webContents.send(event, ...args),
      state,
      port
    )
  );

  ipc.on("page-load", (event) =>
    on_page_load(
      (event, ...args) => win.webContents.send(event, ...args),
      state
    )
  );

  setInterval(
    () =>
      on_periodic(
        (event, ...args) => win.webContents.send(event, ...args),
        state
      ).catch((err) => console.log("serial periodic error", err)),
    1000
  );
};
