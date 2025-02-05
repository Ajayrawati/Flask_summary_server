import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getYouTubeTranscript, summarize } from "./main.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/v1/api", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        console.log(`Received URL: ${url}`);

        const transcript = await getYouTubeTranscript(url);
        
        if (!transcript) {
            return res.status(400).json({ error: "Unable to fetch transcript" });
        }

        const summary = await summarize(transcript);
        console.log("Processing successful");

        return res.status(200).json({ summary });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
