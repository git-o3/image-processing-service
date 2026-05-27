import IngestionService from "../services/ingestionService.js";
import { ProcessingModuleApi } from "../../../processing/publicApi.js";
import { AppError } from "../../../../shared/error.js";
import asyncHandler from "../../../../shared/asyncHandler.js";
import ImageQueryService from "../services/imageQueryService.js";
import TransformService from "../services/transformService.js";

class ImageController {
  /**
   * handle the HTTP upload and ingestion lifecycle
   */
  uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("No image file uploaded.", 400);
    }

    // extract transport-layer data into a clean service payload
    const imageRecord = await IngestionService.registerUpload({
      userId: req.user._id,
      originalName: req.file.originalname,
      storagePath: req.file.path,
    });

    // handoff to the processing module's public gate (which calls broker.js under the hood)
    await ProcessingModuleApi.enqueueImageJob({
      imageId: imageRecord._id,
      storagePath: imageRecord.storagePath,
      originalName: imageRecord.originalName,
    });

    return res.status(201).json({
      success: true,
      message: "Image received and ingestion started.",
      data: imageRecord,
    });
  });

   getImageById = asyncHandler(async (req, res) => {
      const { id } = req.params;

      const image = await imageQueryService.findById(id, req.user._id);

      return res.status(200).json({
        success: true,
        data: image
      });
    });
     
    
    getImages = asyncHandler(async (req, res) => {
      const { page, limit } = req.query;

      const { records, pagination } = await imageQueryService.findPaginated(
        req.user._id,
        { page, limit }
      );

      return res.status(200).json({
        success: true,
        data: records,
        pagination
      });
    });

    deleteImage = asyncHandler(async (req, res) => {
      const { id } = req.params;

      await imageQueryService.remove(id, req.user._id);

      return res.status(200).json({
        success: true,
        message: "Image document and associated storage files permanently purged"
      });
    });

    transformImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { transformations } = req.body;

    // reject early if request payload container is completely empty
    if (!transformations || Object.keys(transformations).length === 0) {
      throw new AppError("Transformations parameter configuration body is required.", 400);
    }

    // pass inputs straight into our class-based transformation service
    const jobPayload = await TransformService.requestTransformation(
      id,
      req.user._id,
      transformations
    );

    // hand off the normalized payload to the broker's message queue fabric
    await ProcessingModuleApi.enqueueImageJob(jobPayload)

    return res.status(202).json({
      success: true,
      message: "Image transformation pipeline successfully initiated.",
      data: {
        imageId: id,
        status: "PROCESSING"
      }
    });
  });
}

export default new ImageController();
