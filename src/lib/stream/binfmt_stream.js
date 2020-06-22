import { Transform } from "stream";

class BinFmtStreamEncoder extends Transform {
  constructor(packet_fmt, opts = {}) {
    super({
      objectMode: true,
      ...opts,
    });
    this.packet_fmt = packet_fmt;
  }

  _transform(chunk, enc, cb) {
    if (chunk === false) {
      /* Abort sequence, pass to next layer */
      this.push(false);
      cb();
      return;
    }
    this.push(this.packet_fmt.pack(chunk));
    cb();
  }

  _flush(cb) {
    cb();
  }
}

class BinFmtStreamDecoder extends Transform {
  constructor(packet_fmt, opts = {}) {
    super({
      objectMode: true,
      ...opts,
    });
    this.packet_fmt = packet_fmt;
  }

  _transform(chunk, enc, cb) {
    this.push(this.packet_fmt.unpack(chunk));
    cb();
  }

  _flush(cb) {
    cb();
  }
}

export { BinFmtStreamEncoder, BinFmtStreamDecoder };
