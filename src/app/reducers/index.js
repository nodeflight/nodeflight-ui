import { combineReducers } from "redux";
import app from "./app";
import serial from "../device/reducers/serial";

export default combineReducers({ app, serial });
