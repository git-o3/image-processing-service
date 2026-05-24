import mongoose from "mongoose";

const Schema = mongoose.Schema;

const imageSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    derivatives: [
      {
        size: {
          type: String,
          enum: ["thumbnail", "mobile", "desktop"], // eg.. "thumbnail", "mobile", "desktop"
        },
        path: {
          type: String,
          required: true, // Location within data/derivatives
        },
        url: {
          type: String, // static nginx path string
          required: true,
        },
      },
    ],
  },
  
  { timestamps: true },

);

const Image = mongoose.model("Image", imageSchema);

export default Image;
