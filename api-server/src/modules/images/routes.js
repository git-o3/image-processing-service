import { Router } from "express";
import upload from "./internal/middleware/upload.js";
import ImageController from "./internal/controllers/imageController.js";

const router = Router();

router.post("/upload", upload.single("image"), ImageController.uploadImage);

export default router;


