import { Pool } from "pg";
import request from "supertest";
import app from "../index";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

describe("Student API", () => {
  beforeAll(async () => {
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
    // Clean up test data
    await pool.query("DROP TABLE IF EXISTS students");
    await pool.end();
  });

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

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body).toHaveProperty("error");
      expect(secondResponse.body.error).toBe("Email already exists");
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
