import { Response } from "express";
import {
  getUserKycService,
  UpdateKYCDetails,
} from "../models/services/kyc.service";
import {
  extractTextFromDocument,
  parseAadhaarDetails,
  parseAccountNo,
  parseGSTIN,
  parseIFSC,
  parsePAN,
} from "../models/services/ocr.service";
import { presignDownload } from "../models/services/upload.service";

export const extractTextFromImage = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const { fileUrl, type } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ error: "fileUrl is required" });
    }

    const presignedUrl = await presignDownload(fileUrl);
    const signedUrl = Array.isArray(presignedUrl) ? presignedUrl[0] : presignedUrl;
    if (!signedUrl) {
      throw new Error("Failed to generate document download URL");
    }

    const response = await fetch(signedUrl as string);
    if (!response?.ok) {
      throw new Error("Failed to download file from R2");
    }

    const buffer = Buffer.from(await response?.arrayBuffer());
    const contentType = response.headers.get("content-type") || "";
    const text = await extractTextFromDocument(buffer, {
      contentType,
      fileName: fileUrl,
    });
    let parsedText = {};
    if (type === "aadhar") parsedText = { ...parseAadhaarDetails(text) };
    if (type === "bankCheque")
      parsedText = { accNo: parseAccountNo(text), ifsc: parseIFSC(text) };
    if (type === "pan") parsedText = { panNumber: parsePAN(text) };
    if (type === "gst") parsedText = { gstin: parseGSTIN(text) };

    return res.json({ text: type ? parsedText : text });
  } catch (err: any) {
    console.error("OCR error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to extract text" });
  }
};

export const storeKycDetails = async (
  req: any,
  res: Response
): Promise<any> => {
  const userId = req.user.sub;

  try {
    const form = req.body;

    const added = await UpdateKYCDetails(userId, form);

    return res.json({
      message: "KYC details saved successfully",
      kyc: added,
    });
  } catch (err) {
    console.error("KYC submission error:", err);
    return res.status(400).json({ message: (err as Error).message, kyc: {} });
  }
};

export const getKycDetails = async (req: any, res: Response): Promise<any> => {
  const userId = req.user.sub;

  try {
    const added = await getUserKycService(userId);

    return res.json({
      message: "KYC details fetched successfully",
      kyc: added,
    });
  } catch (err: any) {
    console.error("KYC Fetch error:", err);
    if (err?.statusCode === 200) {
      return res.status(200).json({ message: "No KYC details found", kyc: {} });
    }
    return res.status(400).json({ message: (err as Error).message, kyc: {} });
  }
};
