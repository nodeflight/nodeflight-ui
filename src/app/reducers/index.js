import { combineReducers } from "redux";
import app from "./app";
import device from "./device";
import config from "./config";

export default combineReducers({ app, device, config });
