
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../uploads");
const CONVERT_DIR = path.join(__dirname, "../converted");

// ensure folders exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(CONVERT_DIR)) fs.mkdirSync(CONVERT_DIR, { recursive: true });

const router = express.Router();
const upload = multer({ dest: UPLOAD_DIR });


// test
router.get("/test", (req, res) => res.json({ ok: true, message: "Image routes connected" }));

/* ---- Image -> image (jpg/png/webp) ---- */
router.post("/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const format = (req.body.format || "png").toLowerCase();
    const allowed = ["png", "jpg", "jpeg", "webp","svg"];
    if (!allowed.includes(format)) return res.status(400).json({ error: "Invalid format" });

    // jpg -> jpeg 
    

    const sharpFormat = format === "jpg" ? "jpeg" : format;
    const outName = `${Date.now()}.${format === "jpg" ? "jpg" : format}`;
    const outPath = path.join(CONVERT_DIR, outName);

    await sharp(req.file.path).toFormat(sharpFormat).toFile(outPath);

    res.download(outPath, (err) => {
      if (err) console.error("Download error:", err);
      // cleanup
      try { fs.unlinkSync(outPath); } catch (e) {}
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    });
  } catch (err) {
    console.error("Image convert error:", err);
    res.status(500).json({ error: err.message || "Image conversion failed" });
  }
});

/* ---- Image -> PDF ---- */
router.post("/to-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imgBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.create();

    // try png then jpg
    let img;
    if (req.file.mimetype === "image/png" || req.file.mimetype === "image/webp") {
      img = await pdfDoc.embedPng(imgBytes);
    } else {
      img = await pdfDoc.embedJpg(imgBytes);
    }

    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

    const pdfBytes = await pdfDoc.save();
    const outPath = path.join(CONVERT_DIR, `${Date.now()}.pdf`);
    fs.writeFileSync(outPath, pdfBytes);

    res.download(outPath, (err) => {
      if (err) console.error("Download error:", err);
      try { fs.unlinkSync(outPath); } catch (e) {}
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    });
  } catch (err) {
    console.error("Image->PDF error:", err);
    res.status(500).json({ error: err.message || "Image -> PDF failed" });
  }
});




export default router;












// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import sharp from "sharp";
// import { PDFDocument } from "pdf-lib";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// /* ---- Image → Other image  */
// router.post("/convert", upload.single("file"), async (req, res) => {
//   try {
//     const { format } = req.body; // expected: "jpg" | "png" | "webp"
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     const outputPath = `converted/${Date.now()}.${format}`;
//     await sharp(req.file.path).toFormat(format).toFile(outputPath);

//     res.download(outputPath);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Image conversion failed" });
//   }
// });

// /* ---- Image → PDF ---- */
// router.post("/to-pdf", upload.single("file"), async (req, res) => {
//   try {
//     const imgBytes = fs.readFileSync(req.file.path);
//     const pdfDoc = await PDFDocument.create();

//     let img;
//     if (req.file.mimetype === "image/png") {
//       img = await pdfDoc.embedPng(imgBytes);
//     } else {
//       img = await pdfDoc.embedJpg(imgBytes);
//     }

//     const page = pdfDoc.addPage([img.width, img.height]);
//     page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

//     const pdfBytes = await pdfDoc.save();
//     const pdfPath = `converted/${Date.now()}.pdf`;

//     fs.writeFileSync(pdfPath, pdfBytes);
//     res.download(pdfPath);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Image → PDF failed" });
//   }
// });

// export default router;
