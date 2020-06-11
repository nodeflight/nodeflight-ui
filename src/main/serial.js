import SerialPort from "serialport";

const SERIAL_PORT_LIST_INTERVAL = 2000;

const get_ports = async () => {
    const serial_ports = await SerialPort.list();
    serial_ports.sort((a,b) => {
        if(a.path < b.path) {
            return -1;
        }
        if(a.path > b.path) {
            return 1;
        }
        return 0;
    });
    return serial_ports;
}

async function poll_serial(wc) {
  wc.send("serial-ports-update", await get_ports());
}

export const serial_init = (ipc, wc) => {
  ipc.handle("serial-ports-list", async (event) => {
    return await get_ports()
  });

  setInterval(() => poll_serial(wc).catch(console.log), 1000);
};
