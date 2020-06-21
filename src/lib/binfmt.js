const dict_flip = (dict) =>
  Object.fromEntries(Object.entries(dict).map(([k, v]) => [v, k]));

class BitBuf {
  constructor(buf) {
    if (buf) {
      this.buffer = buf;
      this.size = buf.length * 8;
    } else {
      this.buffer = Buffer.alloc(32);
      this.size = 0;
    }
  }

  _expand(size) {
    /* Buffer size allocation */
    if (size > this.size) {
      /* Increase size */
      this.size = size;

      /* Calculate new buffer size */
      let buf_size = this.buffer.length;
      while (this.size > buf_size * 8) {
        /* Doubling the buffer size reduces the accumulated complexity of append to O(1) */
        buf_size *= 2;
      }

      /* Check for reallocation */
      if (buf_size != this.buffer.length) {
        const new_buffer = Buffer.allocate(buf_size);
        this.buffer.copy(new_buffer);
        this.buffer = new_buffer;
      }
    }
  }

  read_uint(offset, len) {
    if (offset + len > this.size) {
      throw new Error("Read out of bounds");
    }

    // Calculate start and length of bytes in buffer containing the integer
    const offset_bytes = offset >> 3;
    const len_bytes = ((offset + len + 7) >> 3) - offset_bytes;

    // Calculate bits offset from LSB (end)
    const offset_bits = 7 - ((offset + len + 7) & 7);

    // Calculate bitmask, to apply after shift
    const len_mask = 2 ** len - 1;

    // Fetch data
    const raw_uint = this.buffer.readUIntBE(offset_bytes, len_bytes);

    // Mask out
    return (raw_uint >> offset_bits) & len_mask;
  }

  write_uint(offset, len, value) {
    this._expand(offset + len);

    // Calculate start and length of bytes in buffer containing the integer
    const offset_bytes = offset >> 3;
    const len_bytes = ((offset + len + 7) >> 3) - offset_bytes;

    // Calculate bits offset from LSB (end)
    const offset_bits = 7 - ((offset + len + 7) & 7);

    // Calculate bitmask, to apply after shift
    const len_mask = 2 ** len - 1;

    // Create value and mask buffer
    const value_buf = Buffer.alloc(len_bytes);
    value_buf.writeUIntBE(value * 2 ** offset_bits, 0, len_bytes);
    const mask_buf = Buffer.alloc(len_bytes);
    mask_buf.writeUIntBE(len_mask * 2 ** offset_bits, 0, len_bytes);

    // Apply to internal buffer
    let i;
    for (i = 0; i < len_bytes; i++) {
      this.buffer[offset_bytes + i] =
        (this.buffer[offset_bytes + i] & (0xff ^ mask_buf[i])) |
        (value_buf[i] & mask_buf[i]);
    }
  }

  export() {
    const len_bytes = (this.size + 7) >> 3;
    return this.buffer.slice(0, len_bytes);
  }
}

class BinFmt {
  constructor(fields = []) {
    this.fields = fields;
  }

  uint(name, len) {
    return new BinFmt([
      ...this.fields,
      {
        name,
        _unpack: (buf, offset, obj) => ({
          value: buf.read_uint(offset, len),
          len: len,
        }),
        _pack: (buf, value) => {
          buf.write_uint(buf.size, len, value);
        },
      },
    ]);
  }

  bool(name) {
    return new BinFmt([
      ...this.fields,
      {
        name,
        _unpack: (buf, offset, obj) => ({
          value: buf.read_uint(offset, 1) != 0,
          len: 1,
        }),
        _pack: (buf, value) => {
          buf.write_uint(buf.size, 1, value ? 1 : 0);
        },
      },
    ]);
  }

  cstr(name) {
    return new BinFmt([
      ...this.fields,
      {
        name,
        _unpack: (buf, offset, obj) => {
          if (offset & (0x07 != 0)) {
            throw new Error("cstr must be byte aligned");
          }
          /* TODO: No direct access to buffer */
          const offset_byte = offset >> 3;
          const end_byte = buf.buffer.indexOf(0, offset_byte);
          const length_byte =
            end_byte < 0
              ? buf.buffer.length - offset_byte
              : end_byte - offset_byte;
          return {
            value: buf.buffer
              .slice(offset_byte, offset_byte + length_byte)
              .toString(),
            len: length_byte * 8 + (end_byte < 0 ? 0 : 8),
          };
        },
        _pack: (buf, value) => {
          throw new Error("cstr _pack not implemented yet");
        },
      },
    ]);
  }

  enum(name, len, values) {
    const values_rev = dict_flip(values);
    return new BinFmt([
      ...this.fields,
      {
        name,
        _unpack: (buf, offset, obj) => ({
          value: values_rev[buf.read_uint(offset, len)],
          len: len,
        }),
        _pack: (buf, value) => {
          buf.write_uint(buf.size, len, values[value]);
        },
      },
    ]);
  }

  choose(selector, types) {
    return new BinFmt([
      ...this.fields,
      {
        _unpack: (buf, offset, obj) => {
          const type_id = selector(obj);
          if (types[type_id]) {
            return types[type_id]._unpack(buf, offset, obj);
          } else {
            throw new Error("Unknown type " + type_id);
          }
        },
        _pack: (buf, obj) => {
          const type_id = selector(obj);
          if (types[type_id]) {
            types[type_id]._pack(buf, obj);
          } else {
            throw new Error("Unknown type " + type_id);
          }
        },
      },
    ]);
  }

  _unpack(buf, offset, obj) {
    let pos = 0;
    for (const { name, _unpack } of this.fields) {
      const { value, len } = _unpack(buf, offset + pos, obj);
      if (name) {
        obj[name] = value;
      } else {
        obj = { ...obj, ...value };
      }
      pos += len;
    }
    return { value: obj, len: pos };
  }

  _pack(buf, obj) {
    for (const { name, _pack } of this.fields) {
      if (name) {
        _pack(buf, obj[name]);
      } else {
        _pack(buf, obj);
      }
    }
  }

  unpack(buf) {
    return this._unpack(new BitBuf(buf), 0, {}).value;
  }

  pack(obj) {
    const buf = new BitBuf();
    this._pack(buf, obj);
    return buf.export();
  }
}

export default BinFmt;
