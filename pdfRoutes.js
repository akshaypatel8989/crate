// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import pdfParse from "pdf-parse";
// import { Document, Packer, Paragraph } from "docx";
// import { convert } from "pdf-poppler";
// import ExcelJS from "exceljs";
// import PptxGenJS from "pptxgenjs";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });


// /* ---- PDF → Text ---- */


// /* ---- PDF → Image (First Page) ---- */
// router.post("/to-image", upload.single("file"), async (req, res) => {
//   try {
//     const outputDir = "converted";
//     if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

//     const outputPath = path.join(outputDir, `${Date.now()}`);
//     const opts = {
//       format: "jpeg",
//       out_dir: outputDir,
//       out_prefix: path.basename(outputPath),
//       page: 1,
//     };

//     await convert(req.file.path, opts);
//     const firstImage = `${outputPath}-1.jpg`;
//     res.download(firstImage);
//   } catch (err) {
//     res.status(500).json({ error: "PDF → Image failed" });
//   }
// });

// /* ---- PDF → Excel ---- */
// router.post("/to-excel",upload.single("file"), async (req, res) => {
//   try {
//     const dataBuffer = fs.readFileSync(req.file.path);
//     const pdfData = await pdfParse(dataBuffer);

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("PDF Data");

//     sheet.addRow(["Extracted Text"]);
//     pdfData.text.split("\n").forEach((line) => sheet.addRow([line]));

//     const filePath = `converted/${Date.now()}.xlsx`;
//     await workbook.xlsx.writeFile(filePath);

//     res.download(filePath);
//   } catch (err) {
//     res.status(500).json({ error: "PDF → Excel failed" });
//   }
// });

// export default router;


































// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import pdfParse from "pdf-parse";
// import { Document, Packer, Paragraph } from "docx";
// import XLSX from "xlsx";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// const CONVERTED_FOLDER = path.join(process.cwd(), "converted");
// if (!fs.existsSync(CONVERTED_FOLDER)) fs.mkdirSync(CONVERTED_FOLDER);

// // --- PDF → Text ---
// router.post("/to-text", upload.single("file"), async (req, res) => {
//   try {
//     const buffer = fs.readFileSync(req.file.path);
//     const pdfData = await pdfParse(buffer);

//     const filename = `converted-${Date.now()}.txt`;
//     const outputPath = path.join(CONVERTED_FOLDER, filename);
//     fs.writeFileSync(outputPath, pdfData.text);
//     fs.unlinkSync(req.file.path);

//     res.json({ url: `/converted/${filename}` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "PDF → Text failed" });
//   }
// });

// // --- PDF → Word ---
// router.post("/to-word", upload.single("file"), async (req, res) => {
//   try {
//     const buffer = fs.readFileSync(req.file.path);
//     const pdfData = await pdfParse(buffer);

//     const paragraphs = pdfData.text
//       .split("\n")
//       .filter(line => line.trim() !== "")
//       .map(line => new Paragraph(line));

//     const doc = new Document({ sections: [{ children: paragraphs }] });
//     const docBuffer = await Packer.toBuffer(doc);

//     const filename = `converted-${Date.now()}.docx`;
//     const outputPath = path.join(CONVERTED_FOLDER, filename);
//     fs.writeFileSync(outputPath, docBuffer);
//     fs.unlinkSync(req.file.path);

//     res.json({ url: `/converted/${filename}` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "PDF → Word failed" });
//   }
// });

// // --- PDF → Excel ---
// router.post("/to-excel", upload.single("file"), async (req, res) => {
//   try {
//     const buffer = fs.readFileSync(req.file.path);
//     const pdfData = await pdfParse(buffer);

//     const workbook = XLSX.utils.book_new();
//     const rows = pdfData.text.split("\n").map(line => [line]);
//     const worksheet = XLSX.utils.aoa_to_sheet(rows);
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

//     const filename = `converted-${Date.now()}.xlsx`;
//     const outputPath = path.join(CONVERTED_FOLDER, filename);
//     XLSX.writeFile(workbook, outputPath);
//     fs.unlinkSync(req.file.path);

//     res.json({ url: `/converted/${filename}` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "PDF → Excel failed" });
//   }
// });

// export default router;
