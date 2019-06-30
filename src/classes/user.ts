import bcrypt from "bcrypt";
import { MongooseDocument } from "mongoose";
import MongooseUser from "../schemas/user-schema";
import ApiResponse from "../utils/api-response";
import logger from "../utils/logger";

// User class for creating new users and managing interaction with the db
// through the mongoose schema. This allows us to swap the method of data interaction
// without needing to make changes in the route files.
class User {

    // Adds a user to the db. Returns a promise.
    public static addToDb(user: User): Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve) => {
            if (!user.validateNewUserInfo()) {
                logger.info("Invalid input");
                resolve(new ApiResponse(422, "Invalid input"));
            }
            MongooseUser.create(user.getJsonData(), (err: any, returnUser: any) => {
                if (err) {
                    logger.error(err);
                    resolve(new ApiResponse(500, JSON.stringify(err)));
              } else {
                resolve(new ApiResponse(201, JSON.stringify(returnUser)));
              }
            });
        });
    }

    // Updates resources, or writes a new one. However, since this is for user info the authentication email must match,
    // so no new users are created here.
    public static putToDb(user: User, authEmail: string, authPassword: string): Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve) => {
            if (!user.validateNewUserInfo()) {
                logger.info("Invalid input");
                resolve(new ApiResponse(422, "Invalid input"));
            }

            MongooseUser.authenticate(authEmail, authPassword).then( (result: boolean) => {
                if (!result) {
                    logger.info("auth failed");
                    resolve(new ApiResponse(401, "Unauthorized"));
                } else if (user.email === authEmail) {
                    bcrypt.hash(user.password, 10, (err, hash) => {
                        if (err) {
                            logger.error(err);
                        }

                        user.password = hash;

                        MongooseUser.findOneAndUpdate({ email: user.email }, user.getJsonData() , {upsert: true},
                        (error: any, users: MongooseDocument) => {
                            if (error) {
                                resolve(new ApiResponse(500, error));
                            } else {
                                resolve(new ApiResponse(201, users.toString()));
                            }

                        });
                      });

                } else {
                    resolve(new ApiResponse(401, "Unauthorized"));
                }
            });
        });
    }

    // Deletes a user from the db
    public static deleteFromDb(email: string, authEmail: string, authPassword: string): Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve) => {

            MongooseUser.authenticate(authEmail, authPassword).then( (result: boolean) => {
                if (!result) {
                    resolve(new ApiResponse(401, "Unauthorized"));
                } else if (email === authEmail) {
                    MongooseUser.findOneAndDelete({ email }, (err: any, users: MongooseDocument) => {
                        if (err) {
                            resolve(new ApiResponse(500, err));
                        } else {
                            resolve(new ApiResponse(200, "User deleted"));
                        }

                    });
                } else {
                    resolve(new ApiResponse(401, "Unauthorized"));
                }
            });
        });
    }

    // Returns all the users from the db.
    public static getUsers(email: string, password: string): Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve) => {
            MongooseUser.authenticate(email, password).then( (result: boolean) => {
                if (!result) {
                    resolve(new ApiResponse(401, "Unauthorized"));
                } else {
                    MongooseUser.find({}, (err, users: MongooseDocument) => {
                        if (err) {
                            resolve(new ApiResponse(500, err));
                        } else {
                            resolve(new ApiResponse(200, users.toString()));
                        }

                    });
                }
            });
        });
    }

    // Returns a single user from the db.
    public static getUser(userId: string, email: string, password: string): Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve) => {
            MongooseUser.authenticate(email, password).then( (result: boolean) => {
                if (!result) {
                    resolve(new ApiResponse(401, "Unauthorized"));
                } else {
                    MongooseUser.find({ email: userId }, (err, users: MongooseDocument) => {
                        if (err) {
                            resolve(new ApiResponse(500, err));
                        } else {
                            resolve(new ApiResponse(200, users.toString()));
                        }

                    });
                }
            });
        });
    }

    public email: string;
    public password: string;
    public phone: string;

    constructor(email: string, password: string, phone: string) {
        this.email    = email.trim();
        this.password = password.trim();
        this.phone    = phone.trim();
    }

    // Returns the data in JSON form to be used in mongoose / mongodb
    public getJsonData() {
        return {
            email: this.email,
            password: this.password,
            phone: this.phone
        };
    }

    // Validates input for new users.
    // TODO: check for actual emails / phone numbers.
    public validateNewUserInfo() {
        if (this.email && this.password && this.phone) {
            return true;
        } else {
            return false;
        }
    }
}

export = User;
