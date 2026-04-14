import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyzeRoutes.js";

const app = express();
app.use(
  cors({
    origin: true,
  })
);
app.use(express.json());
app.use("/api", analyzeRoutes);

app.listen(5000, () => console.log("Server running"));
