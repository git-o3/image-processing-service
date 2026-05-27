import { Router } from "express";
import upload from "./internal/middleware/upload.js";
import ImageController from "./internal/controllers/imageController.js";
import { protect } from "../users/publicApi.js";

const router = Router();

router.use(protect)

router.post("/upload", upload.single("image"), ImageController.uploadImage);
router.get("/", ImageController.getImages);
router.get("/:id", ImageController.getImageById);
router.delete("/:id", ImageController.deleteImage);

router.post("/:id/transform", ImageController.transformImage);

export default router;


