import session from "express-session";
import { storage } from "../storage";

export const sessionConfig = session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
});
