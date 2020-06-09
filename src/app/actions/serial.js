import { ipcRenderer as ipc } from "electron";

const serial_update = (ports) => ({
  type: "SERIAL_PORTS_UPDATE",
  ports,
});

const serial_list = () => async (dispatch) => {
  const ports = await ipc.invoke("serial-ports-list");
  dispatch(serial_update(ports));
};

export { serial_update, serial_list };
