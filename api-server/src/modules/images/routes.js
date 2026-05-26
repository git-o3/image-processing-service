import { Router } from "express";
import upload from "./internal/middleware/upload.js";
import ImageController from "./internal/controllers/imageController.js";
import { protect } from "../users/publicApi.js";

const router = Router();

router.post("/upload", protect, upload.single("image"), ImageController.uploadImage);

export default router;


