import Image from "../models/Image.js";
import { AppError } from "../../../../../../shared/error.js";

class IngestionService {
  /**
   * registers a raw file upload into the internal metadata layer
   * @param {object} data
   * @param {string} data.userId
   * @param {string} data.originalName
   * @param {string} data.storagePath
   */

  async registerUpload(data) {
    const { userId, originalName, storagePath } = data;

    if (!userId || !storagePath || !originalName) {
      throw new AppError(
        "Invalid ingestion payload: missing required fields",
        400,
      );
    }

    const imageRecord = await Image.create({
      userId,
      originalName,
      storagePath,
      status: "PENDING",
    });

    // return a plai object to prevent Mongoose internal leaks downstream
    return imageRecord.toObject();
  }
}
