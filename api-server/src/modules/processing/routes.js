import { Router } from "express";
import ProcessingController from "./internal/controllers/processingController.js";

const router = Router();

router.post("/transform", ProcessingController.processImage);

export default router;