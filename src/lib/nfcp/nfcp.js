import SerialPort from "serialport";
import { HDLCFrameDecoder, HDLCFrameEncoder } from "./hdlc";
import { NFCPPack, NFCPUnpack } from "./pktfmt";
import EventEmitter from "events";

const clsop = (cls, op) => (cls << 8) | op;

const SERIAL_PORT_CONFIG = {
  baudRate: 230400,
  parity: "none",
  stopBits: 1,
  dataBits: 8,
  flowControl: false,
};

const CLS_OP_ID = {
  mgmt_session_id: clsop(0, 0),
  mgmt_log_message: clsop(0, 1),
  mgmt_invalid_class: clsop(0, 2),
  mgmt_invalid_opeartion: clsop(0, 3),
};

const CLS_OP_NAME = Object.fromEntries(
  Object.entries(CLS_OP_ID).map(([k, v]) => [v, k])
);

const CHR_ESCAPE = [0x17, 0x19, 0x7d, 0x7e];

const pack_msg = (clsop, is_call, payload) => {
  const id = CLS_OP_ID[clsop];
  return Buffer.from([
    ((id & 0x3f00) << 2) | (is_call ? 0x02 : 0x00),
    id & 0xff,
    ...payload,
  ]);
};

class NfcpClient extends EventEmitter {
  constructor(device, send) {
    super({});
    this.send = send;
    this.port = new SerialPort(device, {
      ...SERIAL_PORT_CONFIG,
      autoOpen: true,
    });
    this.port.on("open", () => this._on_open());
    this.port.on("close", () => this._on_close());
    this.port.on("error", (error) => this._on_error(error));
    this.port.on("drain", () => this._on_drain());

    this.rx = this.port.pipe(new HDLCFrameDecoder()).pipe(new NFCPUnpack());
    this.rx.on("data", (buffer) => this._on_data(buffer));

    this.tx = new HDLCFrameEncoder();
    this.tx.pipe(new NFCPPack()).pipe(this.port);

    do {
      this.session_id = Math.floor(Math.random() * Math.floor(0x100000000));
    } while (this.session_id == 0);

    this.tx.write_abort();
    this._send_session_id();
  }

  close() {
    this.port.close();
    this.port = null;
  }

  get_device() {
    return this.port.path;
  }

  call(cls_op, payload) {}

  inform(cls_op, payload) {}

  _send_session_id() {
    const sess_msg = pack_msg("mgmt_session_id", true, [
      0x00,
      0x12,
      0x13,
      0x14,
      0x19,
    ]);
    this.tx.write(sess_msg);
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

export default NfcpClient;
