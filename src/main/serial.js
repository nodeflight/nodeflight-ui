import SerialPort from "serialport";

export const serial_init = (ipc) => {
    ipc.handle('serial-list', async (event) => {
        const serial_ports = await SerialPort.list();
        return serial_ports;
    });
};