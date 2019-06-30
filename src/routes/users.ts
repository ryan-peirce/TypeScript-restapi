import express from "express";
import User from "../classes/user";
import ApiResponse from "../utils/api-response";
const router = express.Router();

/* GET users listing. */
router.get("/", (req, res, next) => {
  const auth     = new Buffer(req.headers.authorization.split(" ")[1], "base64").toString();
  const email    = auth.split(":")[0];
  const password = auth.split(":")[1];
  User.getUsers(email, password).then( (result: ApiResponse) => {
    res.statusCode = result.responseCode;
    res.send(result.responseMsg);
  });
});

/* GET user. userId will be the target user's email.*/
router.get("/:userId", (req, res, next) => {
  const auth     = new Buffer(req.headers.authorization.split(" ")[1], "base64").toString();
  const email    = auth.split(":")[0];
  const password = auth.split(":")[1];
  const userId   = req.params.userId;
  User.getUser(userId, email, password).then( (result: ApiResponse) => {
    res.statusCode = result.responseCode;
    res.send(result.responseMsg);
  });
});

/* POST new user. */
router.post("/", (req, res, next) => {
  const email    = req.body.email;
  const password = req.body.password;
  const phone    = req.body.phone;

  const user: User = new User(email, password, phone);
  User.addToDb(user).then( (result: ApiResponse) => {
    res.statusCode = result.responseCode;
    res.send(result.responseMsg);
    });
});

/* PUT user. */
router.put("/:userId", (req, res, next) => {
  const auth         = new Buffer(req.headers.authorization.split(" ")[1], "base64").toString();
  const authEmail    = auth.split(":")[0];
  const authPassword = auth.split(":")[1];
  const email        = req.body.email;
  const password     = req.body.password;
  const phone        = req.body.phone;

  const user: User = new User(email, password, phone);
  User.putToDb(user, authEmail, authPassword).then( (result: ApiResponse) => {
    res.statusCode = result.responseCode;
    res.send(result.responseMsg);
    });
});

/* DELETE user. */
router.delete("/:userId", (req, res, next) => {
  const auth         = new Buffer(req.headers.authorization.split(" ")[1], "base64").toString();
  const authEmail    = auth.split(":")[0];
  const authPassword = auth.split(":")[1];
  const email        = req.body.email;

  User.deleteFromDb(email, authEmail, authPassword).then( (result: ApiResponse) => {
    res.statusCode = result.responseCode;
    res.send(result.responseMsg);
    });
});

export = router;
