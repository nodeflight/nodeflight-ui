import { ipcRenderer as ipc } from "electron";

const device_list_update = (ports) => ({
  type: "DEVICE_LIST_UPDATE",
  ports,
});

const device_do_select = (port) => ({
  type: "DEVICE_SELECT",
  port,
});

const device_connect = (port) => async (dispatch) => {
  dispatch({
    type: "DEVICE_CONNECT",
    port,
  });

  /* Clear capabilities while loading */
  dispatch({
    type: "DEVICE_CAP_CLEAR",
  });

  const device_cap_info = await ipc.invoke("device-send", {
    cls: "cap",
    op: "get_info",
    is_call: true,
  });
  if (device_cap_info.cls == "error") {
    console.log("error", device_cap_info.error);
    return;
  }

  let device_info = {
    connected: true,
    cpu_type: device_cap_info.cpu_type,
    cpu_speed_mhz: device_cap_info.cpu_speed_mhz,
    rs: {},
    pp: {},
    md: {},
  };

  // Fetch resources
  for (let i = 0; i < device_cap_info.num_rs; i++) {
    const rs_info = await ipc.invoke("device-send", {
      cls: "cap",
      op: "get_rs",
      is_call: true,
      obj_id: i,
      field_type: "rs_info",
      field_id: 0,
    });
    if (rs_info.cls == "error") {
      console.log("error", rs_info.error);
      return;
    }
    device_info.rs[rs_info.name] = {
      rs_type: rs_info.rs_type,
      num_avail: rs_info.num_avail,
    };
  }

  // Fetch peripherals
  for (let i = 0; i < device_cap_info.num_pp; i++) {
    const pp_info = await ipc.invoke("device-send", {
      cls: "cap",
      op: "get_pp",
      is_call: true,
      obj_id: i,
      field_type: "pp_info",
      field_id: 0,
    });
    if (pp_info.cls == "error") {
      console.log("error", pp_info.error);
      return;
    }
    let arg_opts = Array.from({ length: pp_info.num_args }).map((x) => []);
    for (let j = 0; j < pp_info.num_arg_opts; j++) {
      const arg_info = await ipc.invoke("device-send", {
        cls: "cap",
        op: "get_pp",
        is_call: true,
        obj_id: i,
        field_type: "arg_info",
        field_id: j,
      });
      if (arg_info.cls == "error") {
        console.log("error", pp_info.error);
        return;
      }
      if (arg_info.arg_id >= pp_info.num_args) {
        console.log("Argument nr out of range", pp_info, arg_info);
        return;
      }
      arg_opts[arg_info.arg_id].push({
        tag: arg_info.tag,
      });
    }
    device_info.pp[pp_info.name] = {
      pp_type: pp_info.pp_type,
      num_args: pp_info.num_args,
      arg_opts: arg_opts,
    };
  }

  // Fetch modules
  for (let i = 0; i < device_cap_info.num_md; i++) {
    const md_info = await ipc.invoke("device-send", {
      cls: "cap",
      op: "get_md",
      is_call: true,
      obj_id: i,
      field_type: "md_info",
      field_id: 0,
    });
    if (md_info.cls == "error") {
      console.log("error", md_info.error);
      return;
    }

    let args = Array.from({ length: md_info.num_args }).map((x) => []);
    for (let j = 0; j < md_info.num_args; j++) {
      const arg_info = await ipc.invoke("device-send", {
        cls: "cap",
        op: "get_md",
        is_call: true,
        obj_id: i,
        field_type: "arg_info",
        field_id: j,
      });
      if (arg_info.cls == "error") {
        console.log("error", md_info.error);
        return;
      }
      if (arg_info.arg_id >= md_info.num_args) {
        console.log("Argument nr out of range", md_info, arg_info);
        return;
      }
      args[j] = {
        type: String.fromCharCode(arg_info.arg_type),
      };
    }

    device_info.md[md_info.name] = {
      num_args: md_info.num_args,
      args: args,
    };
  }

  dispatch({
    type: "DEVICE_CAP_SET",
    cap: device_info,
  });
};

const device_disconnect = (port) => ({
  type: "DEVICE_DISCONNECT",
  port,
});

const device_select = (port) => async (dispatch) => {
  dispatch(device_do_select(port));
  ipc.send("device-select", port);
};

export {
  device_list_update,
  device_do_select,
  device_connect,
  device_disconnect,
  device_select,
};
