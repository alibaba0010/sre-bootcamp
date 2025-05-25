import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
console.log(
  `Running in ${isProduction ? "production" : "development"} mode ${
    process.env.LOCAL_DATABASE_URL
  }`
);
const pool = new Pool({
  connectionString: isProduction
    ? process.env.DATABASE_URL
    : process.env.LOCAL_DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || "20"),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
  connectionTimeoutMillis: parseInt(
    process.env.DB_CONNECTION_TIMEOUT || "2000"
  ),
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export default pool;
