import express from "express";
import multer from "multer";
import fs from "fs";
import mammoth from "mammoth";
import PDFDocument from "pdfkit";
// import XLSX from "xlsx";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ---- Word → PDF ---- */
router.post("/to-pdf", upload.single("file"), async (req, res) => {
  try {
    const result = await mammoth.extractRawText({ path: req.file.path });
    const text = result.value || "No text found";

    const pdfPath = `converted/${Date.now()}.pdf`;
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(12).text(text, { align: "left" });
    doc.end();

    writeStream.on("finish", () => res.download(pdfPath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Word → PDF failed" });
  }
});

/* ---- Word → Text ---- */
router.post("/to-text", upload.single("file"), async (req, res) => {
  try {
    const result = await mammoth.extractRawText({ path: req.file.path });
    const text = result.value || "No text found";

    const txtPath = `converted/${Date.now()}.txt`;
    fs.writeFileSync(txtPath, text);

    res.download(txtPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Word → Text failed" });
  }
});

  //  word ---> Excel    Not Working 
// router.post("/to-excel",upload.single("file"),async(req,res)=>{
// try{
//   const result = await mammoth.extractRawText({path:req.file.path})
//   const text = result.value || "No Text Found" ;
  
//   const lines = text.split("\n").filter(line =>line.trim() !== "")
//  const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.aoa_to_sheet(lines.map(line => [line]));
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

//     const excelPath = `converted/${Date.now()}.xlsx`;
//     XLSX.writeFile(workbook, excelPath);

//     res.download(excelPath);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Word → Excel failed" });
//   }
// });
export default router;



