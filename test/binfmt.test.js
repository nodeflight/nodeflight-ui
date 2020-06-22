import assert from "assert";
import BinFmt from "../src/lib/binfmt";

const proto_single_byte = new BinFmt()
  .uint("type", 6)
  .bool("flag_a")
  .bool("flag_b")
  .enum("dir", 2, {
    up: 0,
    down: 1,
    left: 2,
    right: 3,
  })
  .choose((obj) => obj.flag_a, {
    false: new BinFmt().uint("value_a", 6),
    true: new BinFmt().uint("value_b", 6),
  });

const proto_byte_overlap = new BinFmt()
  .uint("a", 3)
  .uint("b", 7)
  .uint("c", 15)
  .uint("d", 7);

const proto_cstr = new BinFmt().cstr("str");

const proto_byte_end = new BinFmt().uint("x", 8).end();

describe("BinFmt unpack single byte fields", () => {
  it("should unpack zeros", () => {
    assert.deepStrictEqual(
      proto_single_byte.unpack(Buffer.from([0x00, 0x00])),
      {
        type: 0,
        flag_a: false,
        flag_b: false,
        dir: "up",
        value_a: 0,
      }
    );
  });
  it("should unpack ones", () => {
    assert.deepStrictEqual(
      proto_single_byte.unpack(Buffer.from([0xff, 0xff])),
      {
        type: 63,
        flag_a: true,
        flag_b: true,
        dir: "right",
        value_b: 63,
      }
    );
  });
  it("should unpack variable position", () => {
    assert.deepStrictEqual(
      proto_single_byte.unpack(Buffer.from([0xfc, 0xc0])),
      {
        type: 63,
        flag_a: false,
        flag_b: false,
        dir: "right",
        value_a: 0,
      }
    );
  });
  it("should unpack bit order", () => {
    assert.deepStrictEqual(
      proto_single_byte.unpack(Buffer.from([0x80, 0x80])),
      {
        type: 32,
        flag_a: false,
        flag_b: false,
        dir: "left",
        value_a: 0,
      }
    );
  });
});
describe("BinFmt unpack fields overlapping bytes", () => {
  it("should unpack zeroes", () => {
    assert.deepStrictEqual(
      proto_byte_overlap.unpack(Buffer.from([0x00, 0x00, 0x00, 0x00])),
      { a: 0, b: 0, c: 0, d: 0 }
    );
  });
  it("should unpack ones", () => {
    assert.deepStrictEqual(
      proto_byte_overlap.unpack(Buffer.from([0xff, 0xff, 0xff, 0xff])),
      { a: 0x07, b: 0x7f, c: 0x7fff, d: 0x7f }
    );
  });
  it("should unpack field alignment", () => {
    assert.deepStrictEqual(
      proto_byte_overlap.unpack(Buffer.from([0xe0, 0x3f, 0xff, 0x80])),
      { a: 0x07, b: 0x00, c: 0x7fff, d: 0x00 }
    );
  });
  it("should unpack bit order", () => {
    assert.deepStrictEqual(
      proto_byte_overlap.unpack(Buffer.from([0x90, 0x20, 0x00, 0x40])),
      { a: 0x04, b: 0x40, c: 0x4000, d: 0x40 }
    );
  });
});

describe("BinFmt pack single byte fields", () => {
  it("should pack zeros", () => {
    assert.deepStrictEqual(
      proto_single_byte.pack({
        type: 0,
        flag_a: false,
        flag_b: false,
        dir: "up",
        value_a: 0,
      }),
      Buffer.from([0x00, 0x00])
    );
  });
  it("should pack ones", () => {
    assert.deepStrictEqual(
      proto_single_byte.pack({
        type: 63,
        flag_a: true,
        flag_b: true,
        dir: "right",
        value_b: 63,
      }),
      Buffer.from([0xff, 0xff])
    );
  });
  it("should pack variable position", () => {
    assert.deepStrictEqual(
      proto_single_byte.pack({
        type: 63,
        flag_a: false,
        flag_b: false,
        dir: "right",
        value_a: 0,
      }),
      Buffer.from([0xfc, 0xc0])
    );
  });
  it("should pack bit order", () => {
    assert.deepStrictEqual(
      proto_single_byte.pack({
        type: 32,
        flag_a: false,
        flag_b: false,
        dir: "left",
        value_a: 0,
      }),
      Buffer.from([0x80, 0x80])
    );
  });
});
describe("BinFmt pack fields overlapping bytes", () => {
  it("should pack zeroes", () => {
    assert.deepStrictEqual(
      proto_byte_overlap.pack({ a: 0, b: 0, c: 0, d: 0 }),
      Buffer.from([0x00, 0x00, 0x00, 0x00])
    );
  });
  it("should pack ones", () => {
    assert.deepStrictEqual(
      proto_byte_overlap.pack({ a: 0x07, b: 0x7f, c: 0x7fff, d: 0x7f }),
      Buffer.from([0xff, 0xff, 0xff, 0xff])
    );
  });
  it("should pack field alignment", () => {
    assert.deepStrictEqual(
      proto_byte_overlap.pack({ a: 0x07, b: 0x00, c: 0x7fff, d: 0x00 }),
      Buffer.from([0xe0, 0x3f, 0xff, 0x80])
    );
  });
  it("should pack bit order", () => {
    assert.deepStrictEqual(
      proto_byte_overlap.pack({ a: 0x04, b: 0x40, c: 0x4000, d: 0x40 }),
      Buffer.from([0x90, 0x20, 0x00, 0x40])
    );
  });
});

describe("BinFmt C-type strings", () => {
  it("should unpack with null-termination", () => {
    assert.deepStrictEqual(
      proto_cstr.unpack(
        Buffer.from([
          0x54,
          0x65,
          0x73,
          0x74,
          0x20,
          0x73,
          0x74,
          0x72,
          0x69,
          0x6e,
          0x67,
          0x00, // Null termination
          0x54, // Ignore this
        ])
      ),
      { str: "Test string" }
    );
  });
  it("should unpack with end-of-buffer termination", () => {
    assert.deepStrictEqual(
      proto_cstr.unpack(
        Buffer.from([
          0x54,
          0x65,
          0x73,
          0x74,
          0x20,
          0x73,
          0x74,
          0x72,
          0x69,
          0x6e,
          0x67, // End of buffer
        ])
      ),
      { str: "Test string" }
    );
  });
});

describe("BinFmt buffer end check", () => {
  it("should allow unpack of correct length", () => {
    assert.deepStrictEqual(proto_byte_end.unpack(Buffer.from([0xcc])), {
      x: 0xcc,
    });
  });

  it("should produce error if buffer is too long", () => {
    assert.throws(() => {
      proto_byte_end.unpack(Buffer.from([0xcc, 0xaa]));
    });
  });

  it("should produce error if buffer is too short", () => {
    assert.throws(() => {
      proto_byte_end.unpack(Buffer.from([]));
    });
  });
});
