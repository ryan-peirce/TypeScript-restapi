import { MongooseDocument } from "mongoose";
import MongooseEvent from "../schemas/event-schema";
import MongooseUser from "../schemas/user-schema";
import ApiResponse from "../utils/api-response";
import logger from "../utils/logger";

// Event class for creating new events and managing interaction with the db
// through the mongoose schema. This allows us to swap the method of data interaction
// without needing to make changes in the route files.
class Event {

    // Returns all the users from the db.
    public static getEvents(email: string, password: string, userEmail: string, lastDay: boolean):
    Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve) => {
            MongooseUser.authenticate(email, password).then( (result: boolean) => {
                if (!result) {
                    resolve(new ApiResponse(401, "Unauthorized"));
                } else {
                    let query = "{";
                    if (userEmail) {
                        query += '"email": ' + '"' + userEmail + '"';
                    }
                    if (lastDay) {
                        if (userEmail) {
                            query += ", ";
                        }
                        query += '"created": { "$gt": "' + (new Date().getTime() - (60 * 60 * 24 * 1000) ) + '"}';
                    }
                    query += "}";
                    MongooseEvent.find(JSON.parse(query), (err, events: MongooseDocument) => {
                        if (err) {
                            logger.error(err);
                            resolve(new ApiResponse(500, err));
                        } else {
                            resolve(new ApiResponse(200, events.toString()));
                        }

                    });
                }
            });
        });
    }

    // Adds a new event to the db.
    public static addToDb(email: string, password: string, event: Event): Promise<ApiResponse> {
        return new Promise<ApiResponse>((resolve) => {
            if (!event) {
                resolve(new ApiResponse(422, "Invalid input"));
            }
            MongooseUser.authenticate(email, password).then( (result: boolean) => {
                if (!result) {
                    resolve(new ApiResponse(401, "Unauthorized"));
                } else {
                    MongooseEvent.create(event.getJsonData(), (err: any, events: MongooseDocument) => {
                        if (err) {
                            logger.error(err);
                            resolve(new ApiResponse(500, err));
                        } else {
                            resolve(new ApiResponse(201, events.toString()));
                        }
                    });
                }
            });
        });
    }

    public created: number;
    public email: string;
    public type: string;

    constructor(email: string, type: string) {
        this.created   = new Date().getTime();
        this.email     = email.trim();
        this.type      = type.trim();
    }

    // Returns the data in JSON form to be used in mongoose / mongodb
    public getJsonData() {
        return {
            created:   this.created,
            email:     this.email,
            type:      this.type
        };
    }
}

export = Event;
