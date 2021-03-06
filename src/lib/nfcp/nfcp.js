import SerialPort from "serialport";
import { HDLCFrameDecoder, HDLCFrameEncoder } from "../stream/hdlc";
import {
  BinFmtStreamEncoder,
  BinFmtStreamDecoder,
} from "../stream/binfmt_stream";
import nfcp_packet from "./nfcp_packet";
import EventEmitter from "events";

const KEEPALIVE_INTERVAL = 1000;
const CALL_TIMEOUT = 5; /* In number of keepalive intervals */

const SERIAL_PORT_CONFIG = {
  baudRate: 230400,
  parity: "none",
  stopBits: 1,
  dataBits: 8,
  flowControl: false,
};

class NfcpClient extends EventEmitter {
  constructor(path) {
    super({});

    this.remote = {
      version: null,
      connected: false,
    };
    this.keepalive_timeout = false;

    this.port = new SerialPort(path, {
      ...SERIAL_PORT_CONFIG,
      autoOpen: false,
    });
    this.port.on("open", () => this._on_open());
    this.port.on("close", () => this._on_close());
    this.port.on("error", (error) => this._on_error(error));
    this.port.on("drain", () => console.log("serial port drain"));

    this.rx = this.port
      .pipe(new HDLCFrameDecoder())
      .pipe(new BinFmtStreamDecoder(nfcp_packet));
    this.rx.on("data", (buffer) => this._on_rx(buffer));

    this.tx = new BinFmtStreamEncoder(nfcp_packet);
    this.tx.pipe(new HDLCFrameEncoder()).pipe(this.port);

    this.last_seq_nr = 0;

    this.active_calls = {};

    this.port.open();
  }

  _get_seq_nr() {
    this.last_seq_nr = (this.last_seq_nr % 255) + 1;
    return this.last_seq_nr;
  }

  close() {
    this.port.close();
    this.port = null;
  }

  get_path() {
    return this.port.path;
  }

  has_timeout() {
    return !this.remote.connected;
  }

  async send(pkt) {
    const pkt_filled = {
      is_call: false,
      is_resp: false,
      ...pkt,
      seq_nr: this._get_seq_nr(),
    };

    let call_promise = null;

    if (pkt_filled.is_call) {
      call_promise = new Promise((resolve, reject) => {
        this.active_calls[pkt_filled.seq_nr] = {
          resolve,
          reject,
          timeout: CALL_TIMEOUT,
        };
      });
    }

    // console.log("NFCP TX", pkt_filled);
    await new Promise((resolve, reject) =>
      this.tx.write(pkt_filled, undefined, resolve)
    );

    if (pkt_filled.is_call) {
      return await call_promise;
    } else {
      return null;
    }
  }

  _timeout_tick() {
    const active_seq_nrs = Object.keys(this.active_calls);
    for(const seq_nr of active_seq_nrs) {
      this.active_calls[seq_nr].timeout -= 1;
      if(this.active_calls[seq_nr].timeout <= 0) {
        this.active_calls[seq_nr].reject(new Error("call timeout"));
        delete this.active_calls[seq_nr];
      }
    }
  }

  _send_keepalive() {
    this.send({
      cls: "mgmt",
      op: "session_id",
      is_call: true,
      session_id: this.session_id,
    })
      .then((result) => {
        if (result.version && this.remote.connected) {
          throw new Error("Session restarted");
        }
        if (!result.version && !this.remote.connected) {
          throw new Error("Old session still running?");
        }
        if (result.version) {
          this.remote.version = result.version;
          this.remote.connected = true;
          this.emit("open");
        }
      })
      .catch((err) => {
        this.close();
        console.log("Can't send keeaplive", err);
      });
    
      this._timeout_tick();
  }

  _on_open() {
    /* All sessions should start with a new session_id */
    do {
      this.session_id = Math.floor(Math.random() * Math.floor(0x100000000));
    } while (this.session_id == 0);

    /* Abort sequence */
    this.tx.write(false);
    this._send_keepalive();
    this.keepalive_timer = setInterval(
      () => this._send_keepalive(),
      KEEPALIVE_INTERVAL
    );
  }

  _on_close() {
    if (this.keepalive_timer) {
      clearInterval(this.keepalive_timer);
    }
    this.keepalive_timer = false;
    if (this.remote.connected) {
      this.remote.connected = false;
      this.emit("close");
    }
  }
  _on_rx(pkt) {
    // console.log("NFCP RX", pkt);
    if (pkt.is_resp && pkt.is_call) {
      /* Response, can only be from a call */
      if (this.active_calls[pkt.seq_nr]) {
        this.active_calls[pkt.seq_nr].resolve(pkt);
        delete this.active_calls[pkt.seq_nr];
      } else {
        /* Unknown sequence number */
        console.log("Unknown call response", pkt);
      }
    }
    if (!pkt.is_resp) {
      /* Message from device to client */
      if (pkt.is_call) {
        /* Call, requires response, not yet implemented */
      } else {
        /* Information message */
        if (
          pkt.cls == "mgmt" &&
          (pkt.op == "invalid_cls" || pkt.op == "invalid_op") &&
          pkt.pkt_is_call
        ) {
          /* Invalid class and invalid op as response to a call should abort the call */
          if (this.active_calls[pkt.pkt_seq_nr]) {
            this.active_calls[pkt.pkt_seq_nr].reject(pkt.op);
            delete this.active_calls[pkt.pkt_seq_nr];
          } else {
            /* Unknown sequence number */
            console.log("Invalid cls/op to unknown call", pkt);
          }
        } else {
          const is_processed = this.emit("info", pkt);
          if (!is_processed) {
            console.log("Unhandled info message", pkt);
            /* No handler, which should according to spec reply with an unknown handler info. FW doesn't care, so don't implement for now... */
          }
        }
      }
    }
  }

  _on_error(error) {
    console.log("serial port error", error);
  }
}

export default NfcpClient;
