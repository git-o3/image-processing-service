import QueueProducerService from "./internal/services/queueProducerService.js";

/**
 * processingModuleApi defines the strict, explicit interface that other internal
 * domains (like the images module) are allowed to at and execute
 */

export const ProcessingModuleApi = {
    /**
   * drops an image metadata target straight into the background worker's queue pipeline
   * @param {Object} data 
   * @param {string} data.imageId
   * @param {string} data.storagePath
   * @param {string} data.originalName
   */
  enqueueImageJob: async (data) => {
    // standardize the object schema parameters passed between module
    return await QueueProducerService.dispatchProcessingTask({
        imageId: data.imageId,
        storagePath: data.storagePath,
        originalName: data.originalName
    });
  }
}