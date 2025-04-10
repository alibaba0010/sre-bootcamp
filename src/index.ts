import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import studentRoutes from "./routes/studentRoutes";
import logger from "./utils/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API versioning
app.use("/api/v1", studentRoutes);

// Error handling middleware
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
