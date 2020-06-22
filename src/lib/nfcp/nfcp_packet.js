import BinFmt from "../binfmt";

const nfcp_packet = new BinFmt()
  .enum("cls", 6, {
    mgmt: 0,
    file: 1,
    monitor: 2,
  })
  .bool("is_call")
  .bool("is_resp")
  .choose((obj) => obj.cls, {
    mgmt: new BinFmt().enum("op", 8, {
      session_id: 0,
      log_message: 1,
      invalid_cls: 2,
      invalid_op: 3,
    }),
    file: new BinFmt().enum("op", 8, {
      todo: 0,
    }),
    monitor: new BinFmt().enum("op", 8, {
      todo: 0,
    }),
  })
  .choose((obj) => obj.is_call, {
    false: new BinFmt(),
    true: new BinFmt().uint("seq_nr", 8),
  })
  .choose(
    (obj) =>
      obj.cls +
      "_" +
      obj.op +
      (!obj.is_call ? "_info" : obj.is_resp ? "_resp" : "_req"),
    {
      mgmt_session_id_req: new BinFmt().uint("session_id", 32),
      mgmt_session_id_resp: new BinFmt().cstr("version"),
      mgmt_log_message_info: new BinFmt().uint("context", 8).cstr("message"),
      mgmt_invalid_cls_info: new BinFmt()
        .uint("pkt_cls", 6)
        .bool("pkt_is_call")
        .bool("pkt_is_resp")
        .uint("pkt_op", 8)
        .uint("pkt_seq_nr", 8),
      mgmt_invalid_op_info: new BinFmt()
        .uint("pkt_cls", 6)
        .bool("pkt_is_call")
        .bool("pkt_is_resp")
        .uint("pkt_op", 8)
        .uint("pkt_seq_nr", 8),
      file_todo_req: new BinFmt(),
      monitor_todo_req: new BinFmt(),
    }
  )
  .end();

export default nfcp_packet;
