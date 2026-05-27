import { subscribeToQueue } from "../../../../shared/broker.js";
import { ImageModuleApi } from "../../publicApi.js";

const STATUS_QUEUE = "image_status_updates";

export async function initStatusConsumer() {
    try {
        await subscribeToQueue(STATUS_QUEUE, async (message, ack) => {
            const {
                jobId,
                status,
                derivativePath,
                errorMessage
            } = message;

            if (!jobId || !status) {
                console.warn(
                    "Malformed status update event received. Skipping..."
                );
                return ack();
            }

            console.log(
                `Syncing image state: Job ${jobId} -> ${status}`
            );

            const updateData = {};
 
            if (derivativePath) {
                updateData.$push = {
                    derivatives: {
                        path: derivativePath,
                        url: `/derivatives/${derivativePath.split('/').pop()}`,
                        size: "desktop"
                    }
                }
            }

            if (errorMessage) {
                updateData.errorMessage = errorMessage;
            }

            // execute database mutation through strict public contract boundary
            await ImageModuleApi.updateStatus(
                jobId,
                status,
                updateData
            );

            ack();
        });

        console.log(
            "Status Update Consumer listening for worker feedback loops."
        );
    } catch (error) {
        console.error(
            "Failed to spin up status subscription channel:",
            error.message
        );

        throw new Error(`Status consumer failed to initialize: 
            ${error.message}`)
    }
}
