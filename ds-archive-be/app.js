import express from "express";
import { router as memoryrouter } from "./routes/memories-route.js";
import { router as characterrouter } from "./routes/characters-route.js";
import { router as outfitrouter } from "./routes/outfits-route.js";
import { router as eventrouter } from "./routes/events-route.js";
import cors from "cors";
import { connectDB } from "./mongodb.js";

const app = express();
const port = 8000;

app.use(express.json());

const allowlist = ["http://localhost:3000", "http://localhost:5173"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowlist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Credentials",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/memories", memoryrouter);

app.use("/characters", characterrouter);

app.use("/outfits", outfitrouter);

app.use("/events", eventrouter);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});
