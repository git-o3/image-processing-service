import sharp from "sharp";
import path from "path";
import fs from "fs";

class ImageProcessorService {
  /**
   * orchestrates complex transformations on an incoming image file target
   * @param {string} inputPath - absolute path to original raw file
   * @param {string} outputDir - base directory where processed artifacts go
   * @param {Object} options - configuration for transformations
   */

  async transformImage(inputPath, outputDir, options = {}) {
    const {
      rotation = null, // eg, 90,180, 270, or "auto"
      format = "webp", // e.g "webp", "jpeg", "png"
      filter = null, // e.g "grayscale", "tint", "blur"
      width = null, // target resize scale constraint
      height = null,
    } = options;

    // ensure the derivatives destination directory exists on the shared volume
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // generate a clean filename indicating what parameters were applied
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const finalFilename = `${baseName}_processed.${format}`;
    const outputPath = path.join(outputDir, finalFilename);

    console.log(`Beginning Sharp pipeline initialization for: ${baseName}`);

    // Initialize the sharp pipeline with the original source file
    let pipeline = sharp(inputPath);

    // handle rotations
    if (rotation === "auto") {
      // automatically rotates based on EXIF metadata (important for mobile uploads)
      pipeline = pipeline.rotate();
    } else if (typeof rotation === "number") {
      pipeline = pipeline.rotate(rotation);
    }

    // handle resizing (if dimensions are provided)
    if (width || height) {
      pipeline = pipeline.resize({
        width: width ? parseInt(width, 10) : null,
        height: height ? parseInt(height, 10) : null,
        fit: "inside", // maintain aspect ratio without clipping edges
        withoutEnlargement: true, // prevents blurring small images by upscaling
      });
    }

    // handle creative filters
    if (filter) {
      switch (filter.toLowerCase()) {
        case "grayscale":
        case "greyscale":
          pipeline = pipeline.grayscale();
          break;
        case "blur":
          pipeline = pipeline.blur(5); // soft 5px gaussian blur radius
          break;
        case "negate":
          pipeline = pipeline.negate(); // inverts image channels
          break;
        default:
          console.warn(
            `Filter style [${filter}] unrecognized. skipping layer...`,
          );
      }
    }

    // handle format conversions & optimizations
    switch (format.toLowerCase()) {
      case "webp":
        pipeline = pipeline.webp({ quality: 80, effort: 4 });
        break;
      case "jpeg":
      case "jpg":
        pipeline = pipeline.jpeg({ quality: 85, progressive: true });
        break;
      case "png":
        pipeline = pipeline.png({ compressionLevel: 8, palette: true });
        break;
      default:
        pipeline = pipeline.toFormat(format);
    }

    // execute compiled pipeline buffers straight to the shared disk volume
    const metadata = await pipeline.toFile(outputPath);

    console.log(`File processing successful. Saved to: ${outputPath}`);

    return {
      filename: finalFilename,
      path: outputPath,
      format: metadata.format,
      size: metadata.size,
      width: metadata.width,
      height: metadata.height,
    };
  }
}

export default new ImageProcessorService();
