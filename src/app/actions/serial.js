import { ipcRenderer as ipc } from "electron";

export const serial_list = () => async (dispatch) => {
  const ports = await ipc.invoke("serial-list");
  dispatch({
    type: "SERIAL_PORTS_UPDATE",
    ports,
  });
};
