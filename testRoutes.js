import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { Document, Packer, Paragraph } from "docx";
import { convert } from "pdf-poppler";
import ExcelJS from "exceljs";
import PptxGenJS from "pptxgenjs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ---- PDF → Word ---- */
router.post("/to-word", upload.single("file"), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const doc = new Document({
      sections: [{ children: [new Paragraph(pdfData.text)] }],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = `converted/${Date.now()}.docx`;
    fs.writeFileSync(filePath, buffer);

    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: "PDF → Word failed" });
  }
});

/* ---- PDF → Text ---- */
router.post("/to-text", upload.single("file"), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const txtPath = `converted/${Date.now()}.txt`;
    fs.writeFileSync(txtPath, pdfData.text);

    res.download(txtPath);
  } catch (err) {
    res.status(500).json({ error: "PDF → Text failed" });
  }
});

/* ---- PDF → Image (First Page) ---- */
router.post("/to-image", upload.single("file"), async (req, res) => {
  try {
    const outputDir = "converted";
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const outputPath = path.join(outputDir, `${Date.now()}`);
    const opts = {
      format: "jpeg",
      out_dir: outputDir,
      out_prefix: path.basename(outputPath),
      page: 1,
    };

    await convert(req.file.path, opts);
    const firstImage = `${outputPath}-1.jpg`;
    res.download(firstImage);
  } catch (err) {
    res.status(500).json({ error: "PDF → Image failed" });
  }
});

/* ---- PDF → Excel ---- */
router.post("/to-excel",upload.single("file"), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PDF Data");

    sheet.addRow(["Extracted Text"]);
    pdfData.text.split("\n").forEach((line) => sheet.addRow([line]));

    const filePath = `converted/${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: "PDF → Excel failed" });
  }
});

/* ---- PDF → PowerPoint ---- */
router.post("/to-ppt", upload.single("file"), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const pptx = new PptxGenJS();
    const slides = pdfData.text.split("\n\n");

    slides.forEach((chunk) => {
      const slide = pptx.addSlide();
      slide.addText(chunk, { x: 1, y: 1, w: 8, h: 5, fontSize: 18 });
    });

    const filePath = `converted/${Date.now()}.pptx`;
    await pptx.writeFile({ fileName: filePath });

    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: "PDF → PowerPoint failed" });
  }
});

export default router;
