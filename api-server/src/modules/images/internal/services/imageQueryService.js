import fs from "fs/promises";
import Image from "../models/Image.js";
import { AppError } from "../../../../shared/error.js";


class ImageQueryService {
    /**
     * fetch a single image ensuring user ownership
     */
    async findById(id, userId) {
        const image = await Image.findOne({ _id: id, userId })
        .select("-__v")
        .lean();

        if (!image) {
            throw new AppError("The requested image asset does not exist or is unauthorized.", 404)
        }
        return image;
    }
    /**
     * fetch a paginated array of metadata records for a user
     */
    async findPaginated(userId, { page = 1, limit = 10}) {
        const parsedPage = Math.max(1, parseInt(page, 10));
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (parsedPage - 1) * parsedLimit;

        const [records, totalCount] = await Promise.all([
            Image.find({ userId })
            .select("-__v")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .lean(),
          Image.countDocuments({ userId })
        ]);

        return {
            records,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / parsedLimit),
                currentPage: parsedPage,
                limit: parsedLimit
            }
        };
    }

    /**
     * drop the database document and delete files from persistent storage
     */
    async remove(id, userId) {
        const image = await Image.findOne({ _id: id, userId });
        if (!image) {
            throw new AppError("The requested image asset does not exist or is unauthorized", 404)
        }

        // gather original + derivative file paths
        const derivativePaths = image.derivatives?.map(d => d.path) || [];
        const filePaths = [
            image.storagePath,
            ...derivativePaths
        ].filter(Boolean);

        await Promise.all(
            filePaths.map(async (filePath) => {
                try {
                    await fs.unlink(filePath);
                } catch (err) {
                    // log storage volume anomalies without breaking the database transaction
                    console.warn(`Disk warning: File at ${filePath} could not be wiped:`, err.message);
                }
            })
        );

        await Image.deleteOne({ _id: id, userId });
        return { id };
    }
}

export default new ImageQueryService();