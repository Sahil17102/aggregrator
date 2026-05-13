import { Router } from "express";
import {
  createPresignedUrl,
  getPresignedDownloadUrl,
  uploadFile,
} from "../controllers/upload.controller";
import { upload } from "../middlewares/upload";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/presign", requireAuth, createPresignedUrl);
router.post("/file", requireAuth, upload.single("file"), uploadFile);
router.post("/presign-download-url", requireAuth, getPresignedDownloadUrl);

export default router;
