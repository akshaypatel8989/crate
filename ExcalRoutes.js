import express from "express";
import multer from "multer";
import fs from "fs";
import xlsx from "xlsx";
import PDFDocument from "pdfkit";

const router = express.Router();
const upload = multer({ dest: "uploads/" });


router.post("/to-csv", upload.single("file"), (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);

    const csvPath = `converted/${Date.now()}.csv`;
    fs.writeFileSync(csvPath, csvData);
     res.download(csvPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Excel → CSV failed" });
  }
});

router.post("/to-pdf", upload.single("file"), (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const pdfPath = `converted/${Date.now()}.pdf`;
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    sheetData.forEach((row) => {
      doc.text(JSON.stringify(row));
      doc.moveDown();
    });

    doc.end();
    writeStream.on("finish", () => res.download(pdfPath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Excel → PDF failed" });
  }
});

export default router;
