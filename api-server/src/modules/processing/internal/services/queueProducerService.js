import { publishToQueue } from "../../../../shared/broker.js";
import { AppError } from "../../../../shared/error.js";

// define the direct target queue name matching broker's architecture
const QUEUE_NAME = "image_processing_queue";

class QueueProducerService {
  /**
   * publishes an ingestion payload into the image processing pipeline
   * @param {Object} messagePayload - the plain metadata object from IngestionService
   */
  async dispatchProcessingTask(messagePayload) {
    // refactor keep payloads independent from Mongo internals
    const { jobId, inputPath, originalName, options } = messagePayload;
     console.log("📦 Payload received:", JSON.stringify(messagePayload))

    if (!jobId || !inputPath) {
      throw new AppError(
        "Invalid messaging payload: missing job target references.",
        400,
      );
    }

    // standardize the payload layout that the background worker expects to unpack
    const jobData = {
      jobId: jobId.toString(),
      storagePath: inputPath,
      originalName,
      options,
      enqueuedAt: new Date().toISOString(),
      requestedSizes: ["thumbnail", "mobile", "desktop"],
    };

    try {
      // leverage shared broker helper completely
      await publishToQueue(QUEUE_NAME, jobData);

      console.log(
        `[x] Dispatched job for image: ${jobData.jobId} directly to queue [${QUEUE_NAME}]`,
      );
      return true;
    } catch (error) {
      console.error(
        "Failed to dispatch via shared message broker:",
        error.message,
      );
      throw new AppError(
        "Failed to safely queue image for asynchronous background processing.",
        500,
      );
    }
  }
}

export default new QueueProducerService();
