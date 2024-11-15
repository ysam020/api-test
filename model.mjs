import mongoose from "mongoose";

const Schema = mongoose.Schema;

const testSchema = new Schema({
  name: { type: String },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  jobTitle: { type: String },
  zip: { type: String },
});

const testModel = mongoose.model("Test", testSchema);
export default testModel;
