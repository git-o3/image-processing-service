import {
  connectBroker,
  subscribeToQueue,
  publishToQueue
} from "./shared/broker.js";

import imageProcessorService from "./services/imageProcessorService.js";
import path from "path";


const QUEUE_NAME = "image_processing_queue";
const STATUS_QUEUE = "image_status_updates";

/**
 * base directory for storing processed image derivatives.
 * falls back to container-mounted volume path if env is not provided
 */
const DERIVATIVES_DIR =
  process.env.DERIVATIVES_DIR || 
  path.join("/app", "data", "derivatives");

  /**
   * background worker entrypoint.
   * consumes image processing jobs, executes transformations,
   * and emits status update bak to API layer
   */
  async function startWorker() {
    try {
        console.log("Background Worker Initializing...");

        // establish connection to RabbitMQ broker
        await connectBroker();

        /**
         * subscribe to image processing queue.
         * each message represents a transformation job.
         */
        await subscribeToQueue(
            QUEUE_NAME,
            async (jobData, ack) => {
                const { jobId, storagePath } = jobData;

                // validate incoming job payload to bad messages
                if (!jobId || !storagePath) {
                    console.warn(
                        "Malformed processing job received. Skipping..."
                    );

                    return ack();
                }

                console.log(`\n 📩[Job Received] ID: ${jobId}`);

                try {
                    /**
                     * emit Processing state before excution begins
                     * (nice to have for real-time UI / tracking system)
                     */

                    await publishToQueue(STATUS_QUEUE, {
                        jobId,
                        status: "PROCESSING"
                    });

                    /**
                     * execute image transformation pipeline
                     * auto rotation
                     * webp optimization
                     * resize constraint
                     */
                    const processingResult = 
                      await imageProcessorService.transformImage(
                        storagePath,
                        DERIVATIVES_DIR,
                        {
                            rotation: "auto",
                            format: "webp",
                            width: 1200
                        }
                      );

                      /**
                       * emit COMPLETED state after successful processing
                       */
                      await publishToQueue(STATUS_QUEUE, {
                        jobId,
                        status: "COMPLETED",
                        derivativePath: processingResult.path
                      });

                      // acknowledge successful job completion
                      ack();
                } catch (processingError) {
                    console.error(
                        `[Job Failed] Error processing image ${jobId}:`,
                        processingError.message
                    );

                    try {
                        /**
                         * emit FAILED state so API layer can sync failure status
                         */
                        await publishToQueue(STATUS_QUEUE, {
                            jobId,
                            status: "FAILED",
                            errorMessage: processingError.message
                        });

                        // acknowledge job to prevent infinite retry loops
                        ack();
                    } catch (brokerError) {
                        console.error(
                            "Fatal: Failed to publish failure event:",
                            brokerError.message
                        );
                    }
                }
            }
        );
    } catch (error) {
        console.error(
            "Fatal initialization error on Background Worker:",
            error.message
        );

        process.exit(1)
    }
  }

  startWorker();





























