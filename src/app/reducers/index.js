import { combineReducers } from "redux";
import app from "./app";
import serial from "../device/reducers/serial";
import config from "../config/reducers/config";

export default combineReducers({ app, serial, config });
