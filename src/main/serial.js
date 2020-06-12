import SerialPort from "serialport";

const SERIAL_PORT_LIST_INTERVAL = 2000;

const get_ports = async () => {
  const port_list = await SerialPort.list();
  return port_list.reduce((arr, item) => {
    arr[item.path] = item;
    return arr;
  }, {});
};

export const serial_init = (ipc, wc) => {
  ipc.handle("serial-ports-list", async (event) => await get_ports());

  setInterval(
    async () => wc.send("serial-ports-update", await get_ports()),
    1000
  );
};
