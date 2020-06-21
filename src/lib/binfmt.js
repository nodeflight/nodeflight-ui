const dict_flip = (dict) =>
  Object.fromEntries(Object.entries(dict).map(([k, v]) => [v, k]));

const uint_read = (buf, offset, len) => {
  // Calculate start and length of bytes in buffer containing the integer
  const offset_bytes = offset >> 3;
  const len_bytes = ((offset + len + 7) >> 3) - offset_bytes;

  // Calculate bits offset from LSB (end)
  const offset_bits = 7 - ((offset + len + 7) & 7);

  // Calculate bitmask, to apply after shift
  const len_mask = 2 ** len - 1;

  // Fetch data
  const raw_uint = buf.readUIntBE(offset_bytes, len_bytes);

  // Mask out
  return (raw_uint >> offset_bits) & len_mask;
};

class BinFmt {
  constructor(fields = []) {
    this.fields = fields;
  }

  uint(name, len) {
    return new BinFmt([
      ...this.fields,
      {
        name,
        unpack: (buf, offset, obj) => ({
          value: uint_read(buf, offset, len),
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
        unpack: (buf, offset, obj) => ({
          value: uint_read(buf, offset, 1) != 0,
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
        unpack: (buf, offset, obj) => {
          if (offset & (0x07 != 0)) {
            throw new Error("cstr must be byte aligned");
          }
          const offset_byte = offset >> 3;
          const end_byte = buf.indexOf(0, offset_byte);
          const length_byte =
            end_byte < 0 ? buf.length - offset_byte : end_byte - offset_byte;
          return {
            value: buf.slice(offset_byte, offset_byte + length_byte).toString(),
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
        unpack: (buf, offset, obj) => ({
          value: values_rev[uint_read(buf, offset, len)],
          len: len,
        }),
      },
    ]);
  }

  choose(selector, types) {
    return new BinFmt([
      ...this.fields,
      {
        unpack: (buf, offset, obj) => {
          const type_id = selector(obj, buf, offset);
          if (types[type_id]) {
            return types[type_id].unpack(buf, offset, obj);
          } else {
            throw new Error("Unknown type " + type_id);
          }
        },
      },
    ]);
  }

  unpack(buf, offset, obj) {
    if (!offset) {
      offset = 0;
    }
    if (!obj) {
      obj = {};
    }
    let pos = 0;
    for (const { name, unpack } of this.fields) {
      const { value, len } = unpack(buf, offset + pos, obj);
      if (name) {
        obj[name] = value;
      } else {
        obj = { ...obj, ...value };
      }
      pos += len;
    }
    return { value: obj, len: pos };
  }
}

export default BinFmt;
