import mongoose from "mongoose";

interface IEventModel extends mongoose.Document {
    created: number;
    email: string;
    phone: string;
}

const EventSchema = new mongoose.Schema({
    created: {
        required: true,
        trim:     true,
        type:     Number,
        unique:   false
    },
    email: {
        required: true,
        trim:     true,
        type:     String,
        unique:   false
    },
    type: {
        required: true,
        trim:     true,
        type:     String,
        unique:   false
    }
});

const MongooseEvent = mongoose.model<IEventModel>("Event", EventSchema);
export = MongooseEvent;
