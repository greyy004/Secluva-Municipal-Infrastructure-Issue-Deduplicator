import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dedupRoutes from "./src/routes/dedupRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to Secluva! ^_^");
});

app.use('/api/reports', dedupRoutes);

app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
});
