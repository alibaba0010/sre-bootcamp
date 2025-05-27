import { Pool } from "pg";
import request from "supertest";
import app from "../index";
import dotenv from "dotenv";

dotenv.config();
const isProduction = process.env.NODE_ENV === "production";

let server: any;
let pool: Pool;
console.log("Env variable ", process.env.DATABASE_URL);
console.log("Env local variable ", process.env.LOCAL_DATABASE_URL);
// Initialize the pool outside of tests
beforeAll(async () => {
  pool = new Pool({
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

  // Start the server
  server = app.listen(0); // Use port 0 for random available port

  // Create test table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      age INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

afterAll(async () => {
  try {
    // Clean up test data
    await pool.query("DROP TABLE IF EXISTS students");

    // Close the pool properly
    await pool.end();

    // Close the server properly
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  } catch (error) {
    console.error("Cleanup failed:", error);
    throw error;
  }
});

// Clear the table between tests
afterEach(async () => {
  await pool.query("DELETE FROM students");
});

describe("Student API", () => {
  describe("POST /api/v1/students", () => {
    it("should create a new student", async () => {
      const student = {
        name: "John Doe",
        email: "john@example.com",
        age: 25,
      };

      const response = await request(app)
        .post("/api/v1/students")
        .send(student);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(student.name);
      expect(response.body.email).toBe(student.email);
      expect(response.body.age).toBe(student.age);
    });

    it("should not allow duplicate email addresses", async () => {
      const student = {
        name: "John Doe",
        email: "duplicate@example.com",
        age: 25,
      };

      // Create first student
      const firstResponse = await request(app)
        .post("/api/v1/students")
        .send(student);
      expect(firstResponse.status).toBe(201);

      // Try to create second student with same email
      const secondStudent = {
        name: "Jane Doe",
        email: "duplicate@example.com", // Same email
        age: 23,
      };

      const secondResponse = await request(app)
        .post("/api/v1/students")
        .send(secondStudent);

      expect(secondResponse.status).toBe(500);
      expect(secondResponse.body).toHaveProperty("error");
      expect(secondResponse.body.error).toBe("Internal server error");
    });
  });

  describe("GET /api/v1/students", () => {
    it("should get all students", async () => {
      const response = await request(app).get("/api/v1/students");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/v1/students/:id", () => {
    it("should get a student by id", async () => {
      // First create a student
      const student = {
        name: "Jane Doe",
        email: "jane@example.com",
        age: 22,
      };

      const createResponse = await request(app)
        .post("/api/v1/students")
        .send(student);

      const id = createResponse.body.id;

      const response = await request(app).get(`/api/v1/students/${id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
      expect(response.body.name).toBe(student.name);
    });

    it("should return 404 for non-existent student", async () => {
      const response = await request(app).get("/api/v1/students/99999");
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/students/:id", () => {
    it("should update a student", async () => {
      // First create a student
      const student = {
        name: "Update Test",
        email: "update@example.com",
        age: 30,
      };

      const createResponse = await request(app)
        .post("/api/v1/students")
        .send(student);

      const id = createResponse.body.id;

      const updateData = {
        name: "Updated Name",
        age: 31,
      };

      const response = await request(app)
        .patch(`/api/v1/students/${id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.age).toBe(updateData.age);
    });
  });

  describe("DELETE /api/v1/students/:id", () => {
    it("should delete a student", async () => {
      // First create a student
      const student = {
        name: "Delete Test",
        email: "delete@example.com",
        age: 28,
      };

      const createResponse = await request(app)
        .post("/api/v1/students")
        .send(student);

      const id = createResponse.body.id;

      const response = await request(app).delete(`/api/v1/students/${id}`);
      expect(response.status).toBe(204);

      // Verify student is deleted
      const getResponse = await request(app).get(`/api/v1/students/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
