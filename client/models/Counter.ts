import mongoose from "mongoose";

export const CounterSchema = new mongoose.Schema({
    name: String,
    value: Number
})

export default mongoose.models.Counter || mongoose.model("Counter", CounterSchema)