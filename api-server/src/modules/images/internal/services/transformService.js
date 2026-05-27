import Image from "../models/Image.js";
import { AppError } from "../../../../shared/error.js";


class TransformService {
  /**
   * validates master asset presence and shapes custom parameters for background compute
   * @param {string} imageId - target database document ID
   * @param {string} userId - user execution 
   * @param {Object} transformations - raw client HTTP JSON payload containing mutations
   */
  async requestTransformation(imageId, userId, transformations) {
    // verify master original image asset exists and belongs to the user
    
    const masterImage = await Image.findOne({ _id: imageId, userId }); 
    
    if (!masterImage) {
      throw new AppError("Original image not found or unauthorized.", 404);
    }

    // map the user's incoming schema parameters into your worker options design
    const workerOptions = {
      width: transformations.resize?.width ? parseInt(transformations.resize.width, 10) : null,
      height: transformations.resize?.height ? parseInt(transformations.resize.height, 10) : null,
      rotation: transformations.rotate !== undefined ? transformations.rotate : "auto",
      format: transformations.format || "webp",
      filter: transformations.filters?.grayscale ? "grayscale" : null
    };

    // safely append alternative worker filters
    if (transformations.filters?.blur) workerOptions.filter = "blur";
    if (transformations.filters?.negate) workerOptions.filter = "negate";

    // flag asset state as PROCESSING
    await Image.updateOne(
      { _id: imageId },
      { $set: { status: "PROCESSING" } }
    );
     
    // return unified contract payload structured precisely for background broker execution
    return {
      jobId: masterImage._id.toString(),
      inputPath: masterImage.storagePath,
      options: workerOptions
    };
  }
}


export default new TransformService();