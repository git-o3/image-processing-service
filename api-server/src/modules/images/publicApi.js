import IngestionService from "./internal/services/ingestionService.js";
import Image from "./internal/models/Image.js"

/**
 * publicApi defines the strict, explicit interface other internal modules
 * are allowed to access. this prevents tight coupling
 */
export const ImageModuleApi = {
    // expose the service method if another module needs to trigger ingestion programmatically
    registerUpload: (data) => IngestionService.registerUpload(data),

    // expose a read-only finder method for metadata verification across modules
    findById: async (id) => {
        const record = await Image.findById(id);
        return record ? record.toObject() : null;
    }
};