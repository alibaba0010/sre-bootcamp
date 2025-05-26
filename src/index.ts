import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import studentRoutes from "./routes/studentRoutes";
import logger from "./utils/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // 2 requests per minute
  message: "Too many requests from this IP, please try again after a minute",
  handler: (req, res) => {
    console.log(req);
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: "Too many requests, please try again later.",
    });
  },
});
// Add logging middleware
app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const ipv4 = ip.split(",")[0].trim();
  console.log("Incoming request:", ipv4);
  logger.info(`Incoming ${req.method} request to ${req.url}`, { ip });
  next();
});
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply rate limiting to all routes
app.use(limiter);

app.use("/api/v1", studentRoutes);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

export default app;
