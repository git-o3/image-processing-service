import IngestionService from "./internal/services/ingestionService.js";
import Image from "./internal/models/Image.js";

/**
 * publicApi defines the strict, explicit interface other internal modules
 * are allowed to access. this prevents tight coupling
 */
export const ImageModuleApi = {
    // trigger ingestion programmatically
    registerUpload: (data) =>
        IngestionService.registerUpload(data),

    // read-only metadata lookup
    findById: async (id) => {
        const record = await Image.findById(id).lean();
        return record || null;
    },

    // synchronize processing state updates
    updateStatus: async (
        jobId,
        status,
        extraFields = {}
    ) => {
        return await Image.findByIdAndUpdate(
            jobId,
            {
                ...extraFields,
                status
            },
            {
                returnDocument: "after",  // Mongoose deprecation warning to Use "returnDocument" instead of "new"
                runValidators: true
            }
        );
    }
};