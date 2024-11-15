import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import testModel from "./model.mjs";

dotenv.config();

const MONGODB_URI =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_MONGODB_URI
    : process.env.DEV_MONGODB_URI;

const app = express();
app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.set("strictQuery", true);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    minPoolSize: 10,
    maxPoolSize: 1000,
  })
  .then(async () => {
    app.post("/api/post-all", async (req, res) => {
      console.log("a");
      try {
        // Extract data from request body
        const data = req.body;

        // Insert data into the database
        await testModel.create(data);

        // Send a success response
        res.status(201).json({
          message: "Data inserted successfully",
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          message: "Error inserting data",
          error: err.message,
        });
      }
    });

    app.post("/api/post-each", async (req, res) => {
      const { name, email, address, city, zip, step } = req.body;
      try {
        // Find an existing document by name and email
        const existingDocument = await testModel.findOne({ name, email });

        if (existingDocument) {
          // Update the existing document with data from the current step
          if (step === 1) {
            existingDocument.address = address;
            existingDocument.city = city;
            existingDocument.zip = zip;
          }
          await existingDocument.save();
          res.status(200).json({ message: "Data updated successfully." });
        } else if (step === 0) {
          // Create a new document for the first step
          await testModel.create({ name, email });
          res.status(201).json({ message: "Data inserted successfully." });
        } else {
          res.status(400).json({ message: "Invalid step or missing data." });
        }
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ message: "Error processing data", error: err.message });
      }
    });

    app.listen(9002, () => {
      console.log(`BE started at port 9002`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed due to app termination");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed due to app termination");
  process.exit(0);
});
