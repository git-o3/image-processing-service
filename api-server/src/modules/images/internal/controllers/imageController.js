import IngestionService from "../services/ingestionService.js";
import { AppError } from "../../../../shared/error.js";
import asyncHandler from "../../../../shared/asyncHandler.js";

class ImageController {
    /**
     * handle the HTTP upload and ingestion lifecycle
     */
   uploadImage = asyncHandler(async (req, res) => {
    if(!req.file) {
        throw new AppError("No image file upload.", 400);
    }

    // extract transport-layer data into a clean service payload
    const imageRecord = await IngestionService.registerUpload({
        userId: req.user._id,
        originalName: req.file.originalname,
        storagePath: req.file.path
    });

    return res.status(201).json({
        success: true,
        message: "Image received and ingestion started.",
        data: imageRecord
    });
   });
}

export default new ImageController();