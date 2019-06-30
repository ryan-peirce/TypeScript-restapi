import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import logger from "./utils/logger";

import eventsRouter from "./routes/events";
import usersRouter from "./routes/users";

mongoose.connect("mongodb://localhost/test");

// connect to mongo
const db = mongoose.connection;
db.on("error", logger.error.bind(console, "connection error:"));
db.once("open", () => {
  logger.info("connected to mongoDB");
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/events", eventsRouter);
app.use("/users", usersRouter);

export = app;
