import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Model } from "mongoose";
import logger from "../utils/logger";

interface IUserModel extends mongoose.Document {
  email:    string;
  password: string;
  phone:    string;
}

interface IUserModelFinal extends Model<IUserModel> {
  authenticate(email: string, password: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema({
  email: {
    required: true,
    trim:     true,
    type:     String,
    unique:   true,
  },
  password: {
    required: true,
    trim:     true,
    type:     String
  },
  phone: {
    required: true,
    trim:     true,
    type:     String,
    unique:   false,
  }
});

// hashing a password before saving it to the database
UserSchema.pre<IUserModel>("save", function(next) {
    const user = this;
    logger.info("PRE SAVE HOOOOOK");
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });

// authenticate input against database
UserSchema.statics.authenticate = (email: string, password: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    MongooseUser.findOne({ email })
      .exec((err: any, user: IUserModel) => {
        if (err) {
          logger.error(err);
          resolve(false);
        } else if (!user) {
          logger.info("no user found");
          resolve(false);
        } else {
          bcrypt.compare(password, user.password, (error: any, result) => {
            if (result === true) {
              resolve(true);
            } else {
              logger.info("passwords don't match");
              resolve(false);
            }
          });
        }
      });
    });
  };

const MongooseUser: IUserModelFinal = mongoose.model<IUserModel, IUserModelFinal>("User", UserSchema);
export = MongooseUser;
