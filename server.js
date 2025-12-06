
import express from "express";
import cors from "cors";
import imageRoutes from "./routes/imageRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";
import excelRoutes from "./routes/ExcalRoutes.js";
//import pdfRoutes from "./routes/pdfRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import path from "path";


const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.resolve();

// Serve converted files publicly
app.use("/converted", express.static(path.join(__dirname, "converted")));
app.use("/converted", express.static("converted"));

// app.use("/api/pdf",   pdfRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/words", wordRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/test", testRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});


app.get("/", (req, res) => {
  res.send("File Converter API is running...");
});



// Start server
const PORT =process.env.PORT|| 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});