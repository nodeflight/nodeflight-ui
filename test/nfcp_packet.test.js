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
