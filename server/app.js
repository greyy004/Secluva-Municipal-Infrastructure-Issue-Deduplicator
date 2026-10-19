import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/userCount", (req, res) => {
    res.json({ userCount: 1000 });
});

app.get("/", (req, res) => {
    res.send("Welcome to Secluva! ^_^");
});

app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
});