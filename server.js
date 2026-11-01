require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

// CHECK GEMINI API KEY
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing from your .env file");
    process.exit(1);
}

// GEMINI SETUP
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// MIDDLEWARE
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// SERVE FRONTEND FILES
const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));

// HOME ROUTE
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// TEST ROUTE
app.get("/test", (req, res) => {
    res.send("Correct server is responding!");
});

// ASK GEMINI
app.post("/ask", async (req, res) => {
    try {
        console.log("Request body:", req.body);

        const { question } = req.body || {};

        // Validate question
        if (typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                error: "Please enter a valid question."
            });
        }

        console.log("Question received:", question);

        // Send question to Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: question.trim()
        });

        console.log("Gemini response received");

        // Send answer to frontend
        return res.status(200).json({
            answer: response.text || "No answer was returned."
        });

    } catch (error) {
        console.error("Gemini API Error:", error);

        return res.status(500).json({
            error: "Unable to get an answer from Gemini. Please try again."
        });
    }
});

// HANDLE UNKNOWN ROUTES
app.use((req, res) => {
    return res.status(404).json({
        error: "Route not found."
    });
});

// HANDLE INVALID JSON AND OTHER ERRORS
app.use((err, req, res, next) => {
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            error: "Invalid JSON in request body."
        });
    }

    console.error("Server Error:", err.message);

    return res.status(500).json({
        error: "Internal server error."
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});