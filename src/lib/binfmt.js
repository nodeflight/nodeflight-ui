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

  unpack(buf) {
    return this._unpack(new BitBuf(buf), 0, {}).value;
  }
}

export default BinFmt;
