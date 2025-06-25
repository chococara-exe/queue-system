import mongoose from "mongoose";

export const CustomerSchema = new mongoose.Schema({
    name: String,
    queue: {
        letter: String,
        value: Number,
    },
    contact: String,
    adults: Number,
    children: Number,
    babies: Number,
    babychair: Number,
    status: {
        type: String,
        enum: ["waiting", "completed", "canceled", "absent"],
        default: "waiting"
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },
    tableNumber: Number
})

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);