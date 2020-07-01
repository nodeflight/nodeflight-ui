import { combineReducers } from "redux";
import app from "./app";
import serial from "./serial";
import config from "./config";

export default combineReducers({ app, serial, config });
