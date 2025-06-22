import mongoose, { models } from "mongoose";

const StaffSchema = new mongoose.Schema({
    email: String
})

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);