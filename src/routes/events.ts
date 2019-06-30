import express from "express";
import Event from "../classes/event";
import ApiResponse from "../utils/api-response";
const router = express.Router();

/* GET events listing. 'email' and 'lastday' query params possible.*/
router.get("/", (req, res, next) => {
  const auth         = new Buffer(req.headers.authorization.split(" ")[1], "base64").toString();
  const authEmail    = auth.split(":")[0];
  const authPassword = auth.split(":")[1];
  const userEmail    = req.query.email;
  const lastDay      = req.query.lastday;

  Event.getEvents(authEmail, authPassword, userEmail, lastDay).then( (result: ApiResponse) => {
    res.statusCode = result.responseCode;
    res.send(result.responseMsg);
  });
});

/* POST new event. */
router.post("/", (req, res, next) => {
  const auth         = new Buffer(req.headers.authorization.split(" ")[1], "base64").toString();
  const authEmail    = auth.split(":")[0];
  const authPassword = auth.split(":")[1];
  const type         = req.body.type;

  const event = new Event(authEmail, type);
  Event.addToDb(authEmail, authPassword, event).then( (result: ApiResponse) => {
    res.statusCode = result.responseCode;
    res.send(result.responseMsg);
  });
});

export = router;
