import BinFmt from "../binfmt";

const nfcp_packet = new BinFmt()
  .enum("cls", 6, {
    mgmt: 0,
    cap: 1,
    file: 2,
    monitor: 3,
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
    cap: new BinFmt().enum("op", 8, {
      get_info: 0,
      get_rs: 1,
      get_pp: 2,
      get_md: 3,
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
      cap_get_info_req: new BinFmt(),
      cap_get_info_resp: new BinFmt()
        .uint("num_rs", 16)
        .uint("num_pp", 16)
        .uint("num_md", 16)
        .uint("cpu_speed_mhz", 16)
        .cstr("cpu_type"),
      cap_get_rs_req: new BinFmt()
        .uint("obj_id", 16)
        .enum("field_type", 8, {
          rs_info: 0,
        })
        .uint("field_id", 16),
      cap_get_rs_resp: new BinFmt()
        .uint("obj_id", 16)
        .enum("field_type", 8, {
          rs_info: 0,
        })
        .uint("field_id", 16)
        .choose((obj) => obj.field_type, {
          rs_info: new BinFmt()
            .uint("rs_type", 16)
            .uint("num_avail", 16)
            .cstr("name"),
        }),
      cap_get_pp_req: new BinFmt()
        .uint("obj_id", 16)
        .enum("field_type", 8, {
          pp_info: 0,
          arg_info: 1,
        })
        .uint("field_id", 16),
      cap_get_pp_resp: new BinFmt()
        .uint("obj_id", 16)
        .enum("field_type", 8, {
          pp_info: 0,
          arg_info: 1,
        })
        .uint("field_id", 16)
        .choose((obj) => obj.field_type, {
          pp_info: new BinFmt()
            .enum("pp_type", 8, {
              gpio: 1,
              serial: 2,
              pwm: 3,
              spi: 4,
            })
            .uint("num_args", 16)
            .uint("num_arg_opts", 16)
            .cstr("name"),
          arg_info: new BinFmt().uint("arg_id", 16).cstr("tag"),
        }),
      cap_get_md_req: new BinFmt()
        .uint("obj_id", 16)
        .enum("field_type", 8, {
          md_info: 0,
          arg_info: 1,
        })
        .uint("field_id", 16),
      cap_get_md_resp: new BinFmt()
        .uint("obj_id", 16)
        .enum("field_type", 8, {
          md_info: 0,
          arg_info: 1,
        })
        .uint("field_id", 16)
        .choose((obj) => obj.field_type, {
          md_info: new BinFmt().uint("num_args", 16).cstr("name"),
          arg_info: new BinFmt().uint("arg_type", 8),
        }),
      file_todo_req: new BinFmt(),
      monitor_todo_req: new BinFmt(),
    }
  )
  .end();

export default nfcp_packet;
