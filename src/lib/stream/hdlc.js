import { Transform } from "stream";

const HDLC_FRAME_BOUNDARY = 0x7e;
const HDLC_ESCAPE_CHAR = 0x7d;
const HDLC_ESCAPE_BITS = 0x20;

/* Escape for transmission, in case a link needs them. Not used otherwise */
const HDLC_XON = 0x17;
const HDLC_XOFF = 0x19;

const CRC16_POLY_CCITT = 0x11021;

const crc16ccitt = (buf) =>
  buf.reduce((cur, value) => {
    cur ^= value << 8;
    cur = (cur << 1) ^ (cur & 0x8000 ? CRC16_POLY_CCITT : 0);
    cur = (cur << 1) ^ (cur & 0x8000 ? CRC16_POLY_CCITT : 0);
    cur = (cur << 1) ^ (cur & 0x8000 ? CRC16_POLY_CCITT : 0);
    cur = (cur << 1) ^ (cur & 0x8000 ? CRC16_POLY_CCITT : 0);
    cur = (cur << 1) ^ (cur & 0x8000 ? CRC16_POLY_CCITT : 0);
    cur = (cur << 1) ^ (cur & 0x8000 ? CRC16_POLY_CCITT : 0);
    cur = (cur << 1) ^ (cur & 0x8000 ? CRC16_POLY_CCITT : 0);
    cur = (cur << 1) ^ (cur & 0x8000 ? CRC16_POLY_CCITT : 0);
    return cur;
  }, 0);

class HDLCFrameEncoder extends Transform {
  constructor(opts = {}) {
    super({
      objectMode: true,
      ...opts,
    });
  }

  _transform(chunk, enc, cb) {
    if (chunk === false) {
      /* Abort sequence */
      this.push(Buffer.from([HDLC_ESCAPE_CHAR, HDLC_FRAME_BOUNDARY]));
      cb();
      return;
    }

    /* Add CRC to packet */
    const crc_pkt = crc16ccitt(chunk);
    let pkt = Buffer.concat([
      chunk,
      Buffer.from([(crc_pkt & 0xff00) >> 8, crc_pkt & 0xff]),
    ]);

    /* Calculate target buffer length */
    let tgt_len = 0;
    for (const val of pkt) {
      if (
        val == HDLC_FRAME_BOUNDARY ||
        val == HDLC_ESCAPE_CHAR ||
        val == HDLC_XON ||
        val == HDLC_XOFF
      ) {
        tgt_len += 2;
      } else {
        tgt_len += 1;
      }
    }
    tgt_len += 1;

    /* Encode packet with byte stuffing */
    let enc_buf = Buffer.alloc(tgt_len);
    let wr = 0;
    for (const val of pkt) {
      if (
        val == HDLC_FRAME_BOUNDARY ||
        val == HDLC_ESCAPE_CHAR ||
        val == HDLC_XON ||
        val == HDLC_XOFF
      ) {
        enc_buf[wr++] = HDLC_ESCAPE_CHAR;
        enc_buf[wr++] = val ^ HDLC_ESCAPE_BITS;
      } else {
        enc_buf[wr++] = val;
      }
    }
    enc_buf[wr++] = HDLC_FRAME_BOUNDARY;

    /* Pass buffer further */
    this.push(enc_buf);
    cb();
  }

  _flush(cb) {
    cb();
  }
}

class HDLCFrameDecoder extends Transform {
  constructor(opts = {}) {
    super({
      objectMode: false,
      ...opts,
    });
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, enc, cb) {
    let data = Buffer.concat([this.buffer, chunk]);
    let boundary_idx;
    while ((boundary_idx = data.indexOf(HDLC_FRAME_BOUNDARY)) >= 0) {
      if (boundary_idx == 0) {
        /* Empty packet (no CRC) */
        /* drop packet */
      } else if (data[boundary_idx - 1] == HDLC_ESCAPE_CHAR) {
        /* Contains abort sequence */
        /* drop packet */
      } else {
        /* Normal packet */
        let unpack = Buffer.alloc(boundary_idx);
        let rd = 0;
        let wr = 0;
        while (rd < boundary_idx) {
          if (data[rd] == HDLC_ESCAPE_CHAR) {
            rd++;
            unpack[wr++] = data[rd++] ^ 0x20;
          } else {
            unpack[wr++] = data[rd++];
          }
        }

        if (wr < 2) {
          /* No CRC */
          /* drop packet */
        } else {
          const crc_pkt = unpack.readUInt16BE(wr - 2);
          unpack = unpack.slice(0, wr - 2);
          const crc_chk = crc16ccitt(unpack);

          if (crc_chk != crc_pkt) {
            /* Invalid CRC */
            /* drop packet */
          } else {
            this.push(unpack);
          }
        }
      }

      data = data.slice(boundary_idx + 1);
    }
    this.buffer = data;
    cb();
  }

  _flush(cb) {
    this.buffer = Buffer.alloc(0);
    cb();
  }
}

export { HDLCFrameEncoder, HDLCFrameDecoder };
