import SerialPort from "serialport";

const SERIAL_PORT_LIST_INTERVAL = 2000;

async function poll_serial(wc) {
  const serial_ports = await SerialPort.list();
  wc.send("serial-ports-update", serial_ports);
}

export const serial_init = (ipc, wc) => {
  ipc.handle("serial-ports-list", async (event) => {
    const serial_ports = await SerialPort.list();
    return serial_ports;
  });

  setInterval(() => poll_serial(wc).catch(console.log), 1000);
};
