import { combineReducers } from "redux";
import app from "./app";
import serial from "./serial";

export default combineReducers({ app, serial });
