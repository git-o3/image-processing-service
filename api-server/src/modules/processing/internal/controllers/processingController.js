import QueueProducerService from "../services/queueProducerService.js";
import { AppError } from "../../../../shared/error.js";
import asyncHandler from "../../../../shared/asyncHandler.js";

class ProcessingController {
  /**
   * triggers asynchronous background execution for an image target
   */
  processImage = asyncHandler(async (req, res) => {
    const { imageId, storagePath, originalName } = req.body;

    // validate transport-layer fields immediately
    if (!imageId || !storagePath || !originalName) {
      throw new AppError(
        "Incomplete processing request parameters provided.",
        400,
      );
    }

    // hand the payload over to the queue dispatch service
    await QueueProducerService.dispatchProcessingTask({
      imageId,
      storagePath,
      originalName,
    });

    // 202 accepted for asynchronous tasks
    return res.status(202).json({
      success: true,
      message:
        "Processing task successfully scheduled and handed off to the queue.",
    });
  });
}

export default new ProcessingController();
