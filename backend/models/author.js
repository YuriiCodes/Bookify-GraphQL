import mongoose from "mongoose";

const Schema = mongoose.Schema;
const authorSchema = new Schema({
    name: String,
    age: Number
});

// A model refers to a collection in database
export default mongoose.model("Author", authorSchema);