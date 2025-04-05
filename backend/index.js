import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import quizRoute from "./routes/quiz.route.js";
import uploadRoute from "./routes/upload.route.js";
import serverless from "serverless-http";

dotenv.config();

const app = express();
const FRONTEND_ORIGIN = "https://quizmaster-sepia.vercel.app";

// CORS Configuration
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Credentials"
    ],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());
connectDB();

app.use("/api", authRoute);
app.use("/api", userRoute);
app.use("/api", quizRoute);
app.use("/api", uploadRoute);

export const handler = serverless(app);
