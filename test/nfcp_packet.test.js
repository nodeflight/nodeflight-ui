import assert from "assert";
import nfcp_packet from "../src/lib/nfcp/nfcp_packet";

// This test suite assumes binfmt works (tested in binfmt.test.js), and therefore only validates
// decoding, since that produces more readable comparisons

describe("NFCP packet, MGMT - session_id", () => {
  it("request", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x02, // class: mgmt, is_call: true, is_resp: false
          0x00, // op: session_id
          0xaa, // seq_nr
          0x12, // Session id
          0x34, // Session id
          0x56, // Session id
          0x78, // Session id
        ])
      ),
      {
        cls: "mgmt",
        is_call: true,
        is_resp: false,
        op: "session_id",
        seq_nr: 0xaa,
        session_id: 0x12345678,
      }
    );
  });
  it("response - with version", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x03, // cls: mgmt, is_call: true, is_resp: true
          0x00, // op: session_id
          0xaa, // seq_nr
          0x75, // version string
          0x6e, // version string
          0x69, // version string
          0x74, // version string
          0x74, // version string
          0x65, // version string
          0x73, // version string
          0x74, // version string
        ])
      ),
      {
        cls: "mgmt",
        is_call: true,
        is_resp: true,
        op: "session_id",
        seq_nr: 0xaa,
        version: "unittest",
      }
    );
  });
  it("response - without version", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x03, // cls: mgmt, is_call: true, is_resp: true
          0x00, // op: session_id
          0xaa, // seq_nr
        ])
      ),
      {
        cls: "mgmt",
        is_call: true,
        is_resp: true,
        op: "session_id",
        seq_nr: 0xaa,
        version: "",
      }
    );
  });
});

describe("NFCP packet, MGMT - log_message", () => {
  it("info - message", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x00, // cls: mgmt, is_call: false, is_resp: false
          0x01, // op: session_id
          0x55, // context
          0x6d, // message
          0x65, // message
          0x73, // message
          0x73, // message
          0x61, // message
          0x67, // message
          0x65, // message
        ])
      ),
      {
        cls: "mgmt",
        is_call: false,
        is_resp: false,
        op: "log_message",
        context: 0x55,
        message: "message",
      }
    );
  });
});

describe("NFCP packet, MGMT - invalid_cls", () => {
  it("info", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x00, // cls: mgmt, is_call: false, is_resp: false
          0x02, // op: invalid_cls
          0x32, // pkt_cls: 12, pkt_is_call: true, pkt_is_resp: false
          0x07, // pkt_op: 7
          0x65, // pkt_seq_nr
        ])
      ),
      {
        cls: "mgmt",
        is_call: false,
        is_resp: false,
        op: "invalid_cls",
        pkt_cls: 12,
        pkt_is_call: true,
        pkt_is_resp: false,
        pkt_op: 7,
        pkt_seq_nr: 0x65,
      }
    );
  });
});

describe("NFCP packet, MGMT - invalid_op", () => {
  it("info", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x00, // cls: mgmt, is_call: false, is_resp: false
          0x03, // op: invalid_op
          0x30, // pkt_cls: 12, pkt_is_call: false, pkt_is_resp: false
          0x07, // pkt_op: 7
          0x00, // pkt_seq_nr
        ])
      ),
      {
        cls: "mgmt",
        is_call: false,
        is_resp: false,
        op: "invalid_op",
        pkt_cls: 12,
        pkt_is_call: false,
        pkt_is_resp: false,
        pkt_op: 7,
        pkt_seq_nr: 0,
      }
    );
  });
});

describe("NFCP packet, CAP - get_info", () => {
  it("request", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x06, // cls: cap, is_call: true, is_resp: false
          0x00, // op: get_info
          0x13, // seq_nr
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: false,
        op: "get_info",
        seq_nr: 0x13,
      }
    );
  });
  it("response", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x07, // cls: cap, is_call: true, is_resp: true
          0x00, // op: get_info
          0x13, // seq_nr

          0x01, // Num resources MSB
          0x02, // Num resources LSB
          0x03, // Num peripherals MSB
          0x04, // Num peripherals LSB
          0x05, // Num modules MSB
          0x06, // Num modules LSB
          0x08, // CPU speed MHz MSB
          0x09, // CPU speed MHz LSB
          0x73, // cpu type string - "stm99f999"
          0x74,
          0x6d,
          0x39,
          0x39,
          0x66,
          0x39,
          0x39,
          0x39,
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: true,
        op: "get_info",
        seq_nr: 0x13,
        num_rs: 0x0102,
        num_pp: 0x0304,
        num_md: 0x0506,
        cpu_speed_mhz: 0x0809,
        cpu_type: "stm99f999",
      }
    );
  });
});

describe("NFCP packet, CAP - get_rs", () => {
  it("request", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x06, // cls: cap, is_call: true, is_resp: false
          0x01, // op: get_rs
          0x13, // seq_nr

          0x55, // Object id MSB
          0xaa, // Object id LSB
          0, // Field type
          0x99, // Field index MSB
          0x7e, // Field index LSB
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: false,
        op: "get_rs",
        seq_nr: 0x13,
        obj_id: 0x55aa,
        field_type: "rs_info",
        field_id: 0x997e,
      }
    );
  });
  it("response - field type 0 - rs_info", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x07, // cls: cap, is_call: true, is_resp: true
          0x01, // op: get_rs
          0x13, // seq_nr

          0x55, // Object id MSB
          0xaa, // Object id LSB
          0x00, // Field type
          0x99, // Field index MSB
          0x7e, // Field index LSB

          0x12, // Resource type MSB
          0x34, // Resource type LSB
          0x03, // Num avail MSB
          0x04, // Num avail LSB
          0x74, // name: "test_rs"
          0x65,
          0x73,
          0x74,
          0x5f,
          0x72,
          0x73,
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: true,
        op: "get_rs",
        seq_nr: 0x13,
        obj_id: 0x55aa,
        field_type: "rs_info",
        field_id: 0x997e,
        rs_type: 0x1234,
        num_avail: 0x0304,
        name: "test_rs",
      }
    );
  });
});

describe("NFCP packet, CAP - get_pp", () => {
  it("request", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x06, // cls: cap, is_call: true, is_resp: false
          0x02, // op: get_pp
          0x13, // seq_nr

          0x55, // Object id MSB
          0xaa, // Object id LSB
          0, // Field type
          0x99, // Field index MSB
          0x7e, // Field index LSB
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: false,
        op: "get_pp",
        seq_nr: 0x13,
        obj_id: 0x55aa,
        field_type: "pp_info",
        field_id: 0x997e,
      }
    );
  });
  it("response - field type 0 - pp_info", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x07, // cls: cap, is_call: true, is_resp: true
          0x02, // op: get_pp
          0x13, // seq_nr

          0x55, // Object id MSB
          0xaa, // Object id LSB
          0x00, // Field type - 0 = pp_info
          0x99, // Field index MSB
          0x7e, // Field index LSB

          0x02, // Resource type - 2 = serial
          0x01, // Num args MSB
          0x02, // Num args LSB
          0x01, // Num arg opts MSB
          0x03, // Num arg opts LSB
          0x74, // name: "test_pp"
          0x65,
          0x73,
          0x74,
          0x5f,
          0x70,
          0x70,
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: true,
        op: "get_pp",
        seq_nr: 0x13,

        obj_id: 0x55aa,
        field_type: "pp_info",
        field_id: 0x997e,

        pp_type: "serial",
        num_args: 0x0102,
        num_arg_opts: 0x0103,
        name: "test_pp",
      }
    );
  });
  it("response - field type 1 - arg_info", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x07, // cls: cap, is_call: true, is_resp: true
          0x02, // op: get_pp
          0x13, // seq_nr

          0x55, // Object id MSB
          0xaa, // Object id LSB
          0x01, // Field type - 1 = arg_info
          0x99, // Field index MSB
          0x7e, // Field index LSB

          0x01, // Arg id MSB
          0x02, // Arg id LSB
          0x61, // name: "arg_tag"
          0x72,
          0x67,
          0x5f,
          0x74,
          0x61,
          0x67,
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: true,
        op: "get_pp",
        seq_nr: 0x13,

        obj_id: 0x55aa,
        field_type: "arg_info",
        field_id: 0x997e,

        arg_id: 0x0102,
        tag: "arg_tag",
      }
    );
  });
});

describe("NFCP packet, CAP - get_md", () => {
  it("request", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x06, // cls: cap, is_call: true, is_resp: false
          0x03, // op: get_md
          0x13, // seq_nr
          0x55, // Object id MSB
          0xaa, // Object id LSB
          0, // Field type
          0x99, // Field index MSB
          0x7e, // Field index LSB
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: false,
        op: "get_md",
        seq_nr: 0x13,
        obj_id: 0x55aa,
        field_type: "md_info",
        field_id: 0x997e,
      }
    );
  });
  it("response - field type 0 - md_info", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x07, // cls: cap, is_call: true, is_resp: true
          0x03, // op: get_md
          0x13, // seq_nr

          0x55, // Object id MSB
          0xaa, // Object id LSB
          0x00, // Field type - 0 = md_info
          0x99, // Field index MSB
          0x7e, // Field index LSB

          0x01, // num_args MSB
          0x02, // num_args LSB
          0x6d, // name: "md_name"
          0x64,
          0x5f,
          0x6e,
          0x61,
          0x6d,
          0x65,
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: true,
        op: "get_md",
        seq_nr: 0x13,

        obj_id: 0x55aa,
        field_type: "md_info",
        field_id: 0x997e,

        num_args: 0x0102,
        name: "md_name",
      }
    );
  });
  it("response - field type 1 - arg_info", () => {
    assert.deepStrictEqual(
      nfcp_packet.unpack(
        Buffer.from([
          0x07, // cls: cap, is_call: true, is_resp: true
          0x03, // op: get_md
          0x13, // seq_nr

          0x55, // Object id MSB
          0xaa, // Object id LSB
          0x01, // Field type - 1 = arg_info
          0x99, // Field index MSB
          0x7e, // Field index LSB

          0x70, // arg_type = 'p'
        ])
      ),
      {
        cls: "cap",
        is_call: true,
        is_resp: true,
        op: "get_md",
        seq_nr: 0x13,

        obj_id: 0x55aa,
        field_type: "arg_info",
        field_id: 0x997e,

        arg_type: 0x70,
      }
    );
  });
});
